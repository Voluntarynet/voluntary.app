"use strict"

/*

    BMNetwork

*/

window.BMNetwork = BMFieldSetNode.extend().newSlots({
    type: "BMNetwork",
    servers: null,
    stunServers: null,
    messages: null,
    connection: null,
    localIdentities: null, // set by parent 
    blacklists: null,
    idsBloomFilter: null,
    shared: null,
    isDebugging: false,
    isOpenRelay: false,
}).setSlots({
    init: function () {
        if (BMNetwork._shared) {
            throw new Error("multiple instances of " + this.type() + " singleton")
        }
		
        BMStorableNode.init.apply(this)
		
        //this.setPid("_network")
        this.setTitle("Network")
        this.setNodeMinWidth(250)
        
        this.setConnection(BMConnection.shared())
        this.addSubnode(this.connection())

        this.setServers(NodeStore.shared().rootInstanceWithPidForProto("_servers", BMRServers))
        this.addSubnode(this.servers())

        this.setStunServers(NodeStore.shared().rootInstanceWithPidForProto("_stunServers", BMStunServers))
        this.addSubnode(this.stunServers())
						
        this.setMessages(NodeStore.shared().rootInstanceWithPidForProto("_messages", BMMessages))
        this.addSubnode(this.messages())
		
        this.setBlacklists(NodeStore.shared().rootInstanceWithPidForProto("_blacklists", BMBlacklists))
        this.addSubnode(this.blacklists())
        
        this.addStoredField(BMBoolField.clone().setKey("isOpenRelay").setValueMethod("isOpenRelay").setValueIsEditable(true))

        this.watchIdentities()
    },

    loadFinalize: function() {
        //this.updateIdsBloomFilter()
    },

    watchIdentities: function() {
        if (!this._idsObservation) {
	        this._idsObservation = NotificationCenter.shared().newObservation().setName("didChangeIdentity").setObserver(this).watch()
        }
    },

    shared: function() {   
        let thisClass = BMNetwork     
        if (!thisClass._shared) {
            thisClass._shared = this.clone();
        }
        return thisClass._shared;
    },

    connectedRemotePeers: function () {
        let remotePeers = []
        this.servers().connectedServers().forEach(function (server) {
            remotePeers.appendItems(server.connectedRemotePeers())
        })        
        return remotePeers
    },
    
    connectedRemotePeerCount: function() {
        return this.servers().subnodes().sum(function (p) {
            return p.connectedRemotePeerCount()
        })
    },
    
    serverCount: function () {
        return this.servers().subnodesCount()
    },

    connectedServerCount: function () {
        return this.servers().connectedServers().length
    },
    
    subtitle: function() {
        let parts = []

        let n = this.serverCount()
        parts.push(this.connectedServerCount() + " of " + this.serverCount() + " servers")
        // parts.push(n + " server" + ((n!=1) ? "s" : ""))

        n = this.connectedRemotePeerCount()
        parts.push(n + " peer" + ((n!=1) ? "s" : ""))

        n = this.messages().messages().length
        parts.push(n + " msg" + ((n!=1) ? "s" : ""))

        return parts.join(", ")
    },
    
    broadcastMsg: function(msg) {
        // TODO: add to local inventory
        this.messages().addMessage(msg)
        //this.servers().broadcastMsg(msg)
        return this
    },
    
    addr: function(msg) {
        this.log("got addr")
        this.servers().addr(msg)
    },
    
    onRemotePeerConnect: function(remotePeer) {      
        this.log("onRemotePeerConnect " + remotePeer.shortId())
          
        // servers will send addr msg
        this.servers().onRemotePeerConnect(remotePeer)
        
        // messages will send inv msg
        this.messages().onRemotePeerConnect(remotePeer)
        
        //this.log("Network onRemotePeerConnect this.connectedRemotePeerCount()  = " + this.connectedRemotePeerCount())
        this.scheduleSyncToView()
    },

    // --- identities -----------------------------------------
    
    idWithPublicKeyString: function(publicKeyString) { 
        
        if (publicKeyString === null) {
            console.warn("publicKeyString is null")
        }
        
        let ids = this.allIdentities()   
        let result = ids.detect((id) => { 
            return id.publicKeyString() === publicKeyString
        })
		
        if (!result) {		
		    console.log(this.typeId() + ".idWithPublicKeyString(" + publicKeyString + ") = ", result)
		    console.log("all ids: ", ids.map((id) => { return id.name() + ":" + id.publicKeyString() }))
	    }
        return result
    },

    allRemoteIdentities: function() {
        let allRids = []
        this.localIdentities().subnodes().forEach((id) => { 
            let valids = id.remoteIdentities().validSubnodes()
            //console.log(id.publicKeyString() + " valid rid count: " + valids.length)
            valids.forEach((rid) => {
                allRids.push(rid)
            })
        })
        return allRids
    },
	
    allIdentitiesMap: function() { // only uses valid remote identities
        let ids = ideal.Map.clone()
        this.localIdentities().subnodes().forEach((id) => { 
		    ids.merge(id.allIdentitiesMap())
        })
        return ids
    },

    allIdentities: function() { // only uses valid remote identities
        let ids = []
        ids = this.localIdentities().subnodes().concat(this.allRemoteIdentities())
        return ids
    },
    
    allIdentityPublicKeyStrings: function() {
	    return this.allIdentitiesMap().keys()
        //return this.allIdentities().map((id) => { return id.publicKeyString(); })
    },
	
    /*
	allIdentityNames: function() {
		return this.allIdentities().map((id) => { return id.name(); })
	},

	
	localIdentityNames: function() {
		return this.localIdentities().names()
	},
	
	idWithName: function(aString) {
		return this.allIdentities().detect((id) => { 
			return id.name() === aString
		})
	},
	
	idWithNameOrPubkey: function(aString) {
		return this.allIdentities().detect((id) => { 
			return id.name() === aString || id.publicKeyString() === aString
		})
	},
	*/	
	
    // --- bloom filter for matching ids -----------------------------------------
	
    newDefaultBloomFilter: function() { // proto method?
        let falsePositiveRate = 0.01;
        let maxElementSize = 1000		
        let filter = JSBloom.newFilter(maxElementSize, falsePositiveRate)
        return filter
    },

    didChangeIdentity: function() {
        //console.log(this.typeId() + ".didChangeIdentity()")
        this.updateIdsBloomFilter()
    },
		
    updateIdsBloomFilter: function() {
        //console.log(this.typeId() + ".updateIdsBloomFilter()")
        let oldFilter = this._idsBloomFilter
	
        let ids = this.allIdentities()
		
        /*
		console.log(this.typeId() + ".updateIdsBloomFilter() with " + ids.length + " ids")
		console.log("   local ids:  " + this.localIdentities().subnodes().length)
		console.log("   remote ids: " + this.allRemoteIdentities().length)
		*/
		
        this._idsBloomFilter = this.newDefaultBloomFilter()
		
				
        ids.forEach((id) => {
            this._idsBloomFilter.addEntry(id.publicKeyString());
			
            /*
			if(oldFilter) {
				let f1 = oldFilter.serialized()
				let f2 = this._idsBloomFilter.serialized()
				console.log("--f1: " + f1)
				console.log("--f2: " + f2)
			}
			*/
        })
		
        this.verifyIdsBloom()
		
        if (oldFilter) {
            let f1 = oldFilter.serialized()
            let f2 = this._idsBloomFilter.serialized()
            if (f1 !== f2) {
                this.didChangeIdsBloom()
            }
        }
		
        return this;		
    },
	
    didChangeIdsBloom: function() {
        //console.log(this.typeId() + ".didChangeIdsBloom()")
        //this._didChangeIdsBloomeNote = NotificationCenter.shared().newNote().setSender(this.typeId()).setName("didChangeIdsBloom")
        this.servers().subnodes().forEach((server) => {
            server.reRequestPeerId() 
        })
    },
	
    verifyIdsBloom: function() {
        //console.log(this.typeId() + ".verifyIdsBloom: " + this.idsBloomFilter().serialized().sha256String().substring(0, 6) )
	    this.allIdentities().forEach((id) => {
            let k = id.publicKeyString()
            let doesMatch = this.idsBloomFilter().checkEntry(k)
            //console.log("    key: " + k + " " + doesMatch)
	        if (!doesMatch) {
                throw new Error("bloom is missing key " + k)
            }
	    })
        //console.log("idsBloom verified!")
    },
	
    idsBloomFilter: function() {
        if (this._idsBloomFilter == null) {
            this.updateIdsBloomFilter()
        }
        return this._idsBloomFilter
    },
	
    hasIdentityMatchingBloomFilter: function(bloomFilter) {
        //console.log(this.typeId() + ".hasIdentityMatchingBloomFilter: " + bloomFilter.serialized().sha256String().substring(0, 6) )
	    let match = this.allIdentities().detect((id) => {
            let k = id.publicKeyString()
            let doesMatch = bloomFilter.checkEntry(k)
            //console.log("    key: " + k + " " + doesMatch)
	        return doesMatch
	    }) 
        //console.log("hasIdentityMatchingBloomFilter match = ", match)
        return match != null	        
    },

    shouldRelayForSenderPublicKey: function(aPublicKeyString) {
        return this.allIdentityPublicKeyStrings().includes(aPublicKeyString)
    },

    nodeShouldUseLightTheme: function() {
        return false
    },
	
})
