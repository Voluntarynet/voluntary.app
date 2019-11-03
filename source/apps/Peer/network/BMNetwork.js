"use strict"

/*

    BMNetwork

*/

BMFieldSetNode.newSubclassNamed("BMNetwork").newSlots({
    servers: null,
    stunServers: null,
    messages: null,
    connection: null,
    localIdentities: null, // set by parent 
    blacklists: null,
    idsBloomFilter: null,
    shared: null,
    isOpenRelay: false,
}).setSlots({
    init: function () {
        if (BMNetwork._shared) {
            throw new Error("multiple instances of " + this.type() + " singleton")
        }
		
        BMStorableNode.init.apply(this)
		
        this.setTitle("Network")
        this.setNodeMinWidth(250)
        
        this.setConnection(BMConnection.shared())
        this.addSubnode(this.connection())

        this.setServers(this.nodeStore().rootInstanceWithPidForProto("_servers", BMRServers))
        this.addSubnode(this.servers())

        this.setStunServers(this.nodeStore().rootInstanceWithPidForProto("_stunServers", BMStunServers))
        this.addSubnode(this.stunServers())
						
        this.setMessages(this.nodeStore().rootInstanceWithPidForProto("_messages", BMMessages))
        this.addSubnode(this.messages())
		
        this.setBlacklists(this.nodeStore().rootInstanceWithPidForProto("_blacklists", BMBlacklists))
        this.addSubnode(this.blacklists())
        
        this.addStoredField(BMBooleanField.clone().setKey("isOpenRelay").setValueMethod("isOpenRelay").setValueIsEditable(true))

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
        const thisClass = BMNetwork     
        if (!thisClass._shared) {
            thisClass._shared = this.clone();
        }
        return thisClass._shared;
    },

    connectedRemotePeers: function () {
        const remotePeers = []
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
        const parts = []

        parts.push(this.connectedServerCount() + " of " + this.serverCount() + " servers")
        // parts.push(n + " server" + ((n!=1) ? "s" : ""))

        const peerCount = this.connectedRemotePeerCount()
        parts.push(peerCount + " peer" + ((peerCount!=1) ? "s" : ""))

        const msgCount = this.messages().messages().length
        parts.push(msgCount + " msg" + ((msgCount!=1) ? "s" : ""))

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
        
        const ids = this.allIdentities()   
        const result = ids.detect((id) => { 
            return id.publicKeyString() === publicKeyString
        })
		
        if (!result) {		
		    console.log(this.typeId() + ".idWithPublicKeyString(" + publicKeyString + ") = ", result)
		    console.log("all ids: ", ids.map((id) => { return id.name() + ":" + id.publicKeyString() }))
	    }
        return result
    },

    allRemoteIdentities: function() {
        const allRids = []
        this.localIdentities().subnodes().forEach((id) => { 
            const valids = id.remoteIdentities().validSubnodes()
            //console.log(id.publicKeyString() + " valid rid count: " + valids.length)
            valids.forEach((rid) => {
                allRids.push(rid)
            })
        })
        return allRids
    },
	
    allIdentitiesMap: function() { // only uses valid remote identities
        const ids = ideal.Map.clone()
        this.localIdentities().subnodes().forEach((id) => { 
		    ids.merge(id.allIdentitiesMap())
        })
        return ids
    },

    allIdentities: function() { // only uses valid remote identities
        const ids = this.localIdentities().subnodes().concat(this.allRemoteIdentities())
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
        const falsePositiveRate = 0.01;
        const maxElementSize = 1000		
        const filter = JSBloom.newFilter(maxElementSize, falsePositiveRate)
        return filter
    },

    didChangeIdentity: function() {
        //console.log(this.typeId() + ".didChangeIdentity()")
        this.updateIdsBloomFilter()
    },
		
    updateIdsBloomFilter: function() {
        //console.log(this.typeId() + ".updateIdsBloomFilter()")
        const oldFilter = this._idsBloomFilter
	
        const ids = this.allIdentities()
		
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
				const f1 = oldFilter.serialized()
				const f2 = this._idsBloomFilter.serialized()
				console.log("--f1: " + f1)
				console.log("--f2: " + f2)
			}
			*/
        })
		
        this.verifyIdsBloom()
		
        if (oldFilter) {
            const f1 = oldFilter.serialized()
            const f2 = this._idsBloomFilter.serialized()
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
            const k = id.publicKeyString()
            const doesMatch = this.idsBloomFilter().checkEntry(k)
            //console.log("    key: " + k + " " + doesMatch)
	        if (!doesMatch) {
                throw new Error("bloom is missing key " + k)
            }
	    })
        //console.log("idsBloom verified!")
    },
	
    idsBloomFilter: function() {
        if (this._idsBloomFilter === null) {
            this.updateIdsBloomFilter()
        }
        return this._idsBloomFilter
    },
	
    hasIdentityMatchingBloomFilter: function(bloomFilter) {
        //console.log(this.typeId() + ".hasIdentityMatchingBloomFilter: " + bloomFilter.serialized().sha256String().substring(0, 6) )
	    const match = this.allIdentities().detect((id) => {
            const k = id.publicKeyString()
            const doesMatch = bloomFilter.checkEntry(k)
            //console.log("    key: " + k + " " + doesMatch)
	        return doesMatch
	    }) 
        //console.log("hasIdentityMatchingBloomFilter match = ", match)
        return !Type.isNull(match)	        
    },

    shouldRelayForSenderPublicKey: function(aPublicKeyString) {
        return this.allIdentityPublicKeyStrings().includes(aPublicKeyString)
    },

    nodeShouldUseLightTheme: function() {
        return false
    },
	
})
