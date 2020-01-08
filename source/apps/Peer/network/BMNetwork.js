"use strict"

/*

    BMNetwork

*/

window.BMNetwork = class BMNetwork extends BMFieldSetNode {
    
    initPrototype () {
        this.newSlot("servers", null)
        this.newSlot("stunServers", null)
        this.newSlot("messages", null)
        this.newSlot("connection", null)
        this.newSlot("localIdentities", null).setComment("set by parents")
        this.newSlot("blacklists", null)
        this.newSlot("idsBloomFilter", null)
        this.newSlot("isOpenRelay", false).setShouldStoreSlot(true) //.setField(isOpenRelayField)
    }

    init () {
        if (BMNetwork._shared) {
            throw new Error("multiple instances of " + this.type() + " singleton")
        }

        super.init()
		
        this.setTitle("Network")
        this.setNodeMinWidth(250)
        
        this.setConnection(BMConnection.shared())
        this.addSubnode(this.connection())

        this.setServers(this.defaultStore().rootInstanceWithPidForProto("Servers", BMRServers))
        this.addLinkSubnode(this.servers())

        this.setStunServers(this.defaultStore().rootInstanceWithPidForProto("StunServers", BMStunServers))
        this.addLinkSubnode(this.stunServers())
						
        this.setMessages(this.defaultStore().rootInstanceWithPidForProto("Messages", BMMessages))
        this.addLinkSubnode(this.messages())
		
        this.setBlacklists(this.defaultStore().rootInstanceWithPidForProto("Blacklists", BMBlacklists))
        this.addLinkSubnode(this.blacklists())
        
        const isOpenRelayField = BMBooleanField.clone().setKey("isOpenRelay").setValueMethod("isOpenRelay").setValueIsEditable(true)
        this.addField(isOpenRelayField)
        this.watchIdentities()
    }

    loadFinalize () {
        super.loadFinalize()
        //this.updateIdsBloomFilter()
    }

    watchIdentities () {
        if (!this._idsObservation) {
	        this._idsObservation = NotificationCenter.shared().newObservation().setName("didChangeIdentity").setObserver(this).watch()
        }
    }

    connectedRemotePeers () {
        const remotePeers = []
        this.servers().connectedServers().forEach(function (server) {
            remotePeers.appendItems(server.connectedRemotePeers())
        })        
        return remotePeers
    }
    
    connectedRemotePeerCount () {
        return this.servers().subnodes().sum( p => p.connectedRemotePeerCount())
    }
    
    serverCount () {
        return this.servers().subnodesCount()
    }

    connectedServerCount () {
        return this.servers().connectedServers().length
    }
    
    subtitle () {
        const parts = []

        parts.push(this.connectedServerCount() + " of " + this.serverCount() + " servers")
        // parts.push(n + " server" + ((n!=1) ? "s" : ""))

        const peerCount = this.connectedRemotePeerCount()
        parts.push(peerCount + " peer" + ((peerCount!=1) ? "s" : ""))

        const msgCount = this.messages().messages().length
        parts.push(msgCount + " msg" + ((msgCount!=1) ? "s" : ""))

        return parts.join(", ")
    }
    
    broadcastMsg (msg) {
        // TODO: add to local inventory
        this.messages().addMessage(msg)
        //this.servers().broadcastMsg(msg)
        return this
    }
    
    addr (msg) {
        this.log("got addr")
        this.servers().addr(msg)
    }
    
    onRemotePeerConnect (remotePeer) {      
        this.log("onRemotePeerConnect " + remotePeer.shortId())
          
        // servers will send addr msg
        this.servers().onRemotePeerConnect(remotePeer)
        
        // messages will send inv msg
        this.messages().onRemotePeerConnect(remotePeer)
        
        //this.log("Network onRemotePeerConnect this.connectedRemotePeerCount()  = " + this.connectedRemotePeerCount())
        this.scheduleSyncToView()
    }

    // --- identities -----------------------------------------
    
    idWithPublicKeyString (publicKeyString) { 
        
        if (publicKeyString === null) {
            console.warn("publicKeyString is null")
        }
        
        const ids = this.allIdentities()   
        const result = ids.detect((id) => { 
            return id.publicKeyString() === publicKeyString
        })
		
        if (!result) {		
		    this.debugLog(".idWithPublicKeyString(" + publicKeyString + ") = ", result)
		    console.log("all ids: ", ids.map((id) => { return id.name() + ":" + id.publicKeyString() }))
	    }
        return result
    }

    allRemoteIdentities () {
        const allRids = []
        this.localIdentities().subnodes().forEach((id) => { 
            const valids = id.remoteIdentities().validSubnodes()
            //console.log(id.publicKeyString() + " valid rid count: " + valids.length)
            valids.forEach((rid) => {
                allRids.push(rid)
            })
        })
        return allRids
    }
	
    allIdentitiesMap () { // only uses valid remote identities
        const ids = ideal.Dictionary.clone()
        this.localIdentities().subnodes().forEach((id) => { 
		    ids.merge(id.allIdentitiesMap())
        })
        return ids
    }

    allIdentities () { // only uses valid remote identities
        const ids = this.localIdentities().subnodes().concat(this.allRemoteIdentities())
        return ids
    }
    
    allIdentityPublicKeyStrings () {
	    return this.allIdentitiesMap().keys()
        //return this.allIdentities().map((id) => { return id.publicKeyString(); })
    }
	
    /*
	allIdentityNames () {
		return this.allIdentities().map((id) => { return id.name(); })
	},

	
	localIdentityNames () {
		return this.localIdentities().names()
	},
	
	idWithName (aString) {
		return this.allIdentities().detect((id) => { 
			return id.name() === aString
		})
	},
	
	idWithNameOrPubkey (aString) {
		return this.allIdentities().detect((id) => { 
			return id.name() === aString || id.publicKeyString() === aString
		})
	},
	*/	
	
    // --- bloom filter for matching ids -----------------------------------------
	
    newDefaultBloomFilter () { // proto method?
        const falsePositiveRate = 0.01;
        const maxElementSize = 1000		
        const filter = JSBloom.newFilter(maxElementSize, falsePositiveRate)
        return filter
    }

    didChangeIdentity () {
        //this.debugLog(".didChangeIdentity()")
        this.updateIdsBloomFilter()
    }
		
    updateIdsBloomFilter () {
        //this.debugLog(".updateIdsBloomFilter()")
        const oldFilter = this._idsBloomFilter
	
        const ids = this.allIdentities()
		
        /*
		this.debugLog(".updateIdsBloomFilter() with " + ids.length + " ids")
		console.log("   local ids:  " + this.localIdentities().subnodeCount())
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
    }
	
    didChangeIdsBloom () {
        //this.debugLog(".didChangeIdsBloom()")
        //this._didChangeIdsBloomeNote = NotificationCenter.shared().newNote().setSender(this.typeId()).setName("didChangeIdsBloom")
        this.servers().subnodes().forEach((server) => {
            server.reRequestPeerId() 
        })
    }
	
    verifyIdsBloom () {
        //this.debugLog(".verifyIdsBloom: " + this.idsBloomFilter().serialized().sha256String().substring(0, 6) )
	    this.allIdentities().forEach((id) => {
            const k = id.publicKeyString()
            const doesMatch = this.idsBloomFilter().checkEntry(k)
            //console.log("    key: " + k + " " + doesMatch)
	        if (!doesMatch) {
                throw new Error("bloom is missing key " + k)
            }
	    })
        //console.log("idsBloom verified!")
    }
	
    idsBloomFilter () {
        if (this._idsBloomFilter === null) {
            this.updateIdsBloomFilter()
        }
        return this._idsBloomFilter
    }
	
    hasIdentityMatchingBloomFilter (bloomFilter) {
        //this.debugLog(".hasIdentityMatchingBloomFilter: " + bloomFilter.serialized().sha256String().substring(0, 6) )
	    const match = this.allIdentities().detect((id) => {
            const k = id.publicKeyString()
            const doesMatch = bloomFilter.checkEntry(k)
            //console.log("    key: " + k + " " + doesMatch)
	        return doesMatch
	    }) 
        //console.log("hasIdentityMatchingBloomFilter match = ", match)
        return !Type.isNull(match)	        
    }

    shouldRelayForSenderPublicKey (aPublicKeyString) {
        return this.allIdentityPublicKeyStrings().includes(aPublicKeyString)
    }

    nodeShouldUseLightTheme () {
        return false
    }
	
}.initThisClass()
