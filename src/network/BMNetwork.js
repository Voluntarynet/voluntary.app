
BMNetwork = BMStorableNode.extend().newSlots({
    type: "BMNetwork",
    servers: null,
    stunServers: null,
    messages: null,
    localIdentities: null, // set by parent 
    remoteIdentities: null, // set by parent 
    blacklists: null,
	idsBloomFilter: null,
	shared: null,
	debug: true,
}).setSlots({
    init: function () {
		if (BMNetwork._shared) {
			throw new Error("multiple instances of " + this.type() + " singleton")
		}
		
		BMNetwork._shared = this

        BMStorableNode.init.apply(this)
		
        //this.setPid("_network")
        this.setTitle("Network")
        this.setNodeMinWidth(150)

		this.setServers(NodeStore.shared().rootInstanceWithPidForProto("_servers", BMRServers))
		this.addItem(this.servers())

		this.setStunServers(NodeStore.shared().rootInstanceWithPidForProto("_stunServers", BMStunServers))
		this.addItem(this.stunServers())
						
		this.setMessages(NodeStore.shared().rootInstanceWithPidForProto("_messages", BMMessages))
		this.addItem(this.messages())
		
		this.setBlacklists(NodeStore.shared().rootInstanceWithPidForProto("_blacklists", BMBlacklists))
		this.addItem(this.blacklists())
    },

	shared: function() {
		return BMNetwork._shared
	},

    connectedRemotePeers: function () {
        var remotePeers = []
        this.servers().connectedServers().forEach(function (server) {
            remotePeers.appendItems(server.connectedRemotePeers())
        })        
        return remotePeers
    },
    
    remotePeerCount: function() {
        return this.servers().items().sum(function (p) {
            return p.remotePeerCount()
        })
    },
    
    serverCount: function () {
        return this.servers().itemsLength()
    },
    
    subtitle: function() {
        var parts = []
/*
        parts.push(this.serverCount() + " severs")
        parts.push(this.remotePeerCount() + " peers")
*/
        parts.push(this.serverCount() + " svrs")
        parts.push(this.remotePeerCount() + " prs")

        parts.push(this.messages().messages().length + " msgs")
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
        
        //this.log("Network onRemotePeerConnect this.remotePeerCount()  = " + this.remotePeerCount() )
        //this.didUpdate()
        this.syncToView()
    },

	// --- identities -----------------------------------------
    
    privateKeyForChannelName: function(channelName) {
        var hexName = channelName.toString(16)
        var privateKey = new bitcore.PrivateKey(hexName);
        return privateKey
    },
    
    idWithPubKeyString: function(pubKeyString) {        
        var pubkey = this.localIdentities().idWithPubKeyString(pubKeyString)
        if (pubkey) {
            return pubkey
        }
        return this.remoteIdentities().idWithPubKeyString(pubKeyString)
    },

	allIdentities: function() {
		var ids = []
		ids = this.localIdentities().items().concat(this.remoteIdentities().items())
		return ids
	},
    
	allIdentityPublicKeyStrings: function() {
		return this.allIdentities().map(function(id) { return id.publicKeyString(); })
	},
	
	allIdentityNames: function() {
		return this.allIdentities().map(function(id) { return id.name(); })
	},
	
	localIdentityNames: function() {
		return this.localIdentities().items().map(function(id) { return id.name(); })
	},
	
	remoteIdentityNames: function() {
		return this.remoteIdentities().items().map(function(id) { return id.name(); })
	},
	
	idWithName: function(aName) {
		var id = this.localIdentities().idWithName(aName)
		if (id) {
			return id
		}
		
		id = this.remoteIdentities().idWithName(aName)
		return id
	},
	
	// --- bloom filter for matching ids -----------------------------------------
	
	newDefaultBloomFilter: function() { // proto method?
		var falsePositiveRate = 0.01;
		var maxElementSize = 1000		
		var filter = JSBloom.newFilter(maxElementSize, falsePositiveRate)
		return filter
	},
	
	updateIdsBloomFilter: function() {
		var ids = this.allIdentities()
				
		this._idsBloomFilter = this.newDefaultBloomFilter()
				
		ids.forEach((id) => {
			this._idsBloomFilter.addEntry(id.publicKeyString());
		})
		return this;		
	},
	
	idsBloomFilter: function() {
		if (this._idsBloomFilter == null) {
			this.updateIdsBloomFilter()
		}
		return this._idsBloomFilter
	},
	
	/*
	matching is done on peer connections
	idsBloomFilterMatchesPublicKey: function(aPublicKeyString) {
		return this.idsBloomFilter().checkEntry(aPublicKeyString)
	},
	*/
	
	shouldRelayForSenderPublicKey: function(aPublicKeyString) {
		return this.allIdentityPublicKeyStrings().includes(aPublicKeyString)
	},
	
})
