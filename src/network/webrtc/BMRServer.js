
// A Rendezvous Server

BMRServer = BMStorableNode.extend().newSlots({
    type: "BMRServer",
   // host: 'peers.bitmarkets.org',
    host: '127.0.0.1',
    port: 9000,
    serverConnection: null,
	bloomDistance: null,
	debug: true,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setShouldStore(true)
		this.setShouldStoreItems(true)
		
        this.setServerConnection(BMServerConnection.clone().setServer(this))
        this.addItem(this.serverConnection())
        //this.setTitle("RTC Server")
        this.addStoredSlots(["host", "port"])
        this.setShouldStoreItems(false)
        this.actions().appendIfAbsent("delete")
        this.setNodeMinWidth(160)
    },

    servers: function () {
        return this.parentNode()
    },

    title: function () {
        //return "RTC Server " + this.host() + "  " + this.port()
        return this.host() + "  " + this.port()
    },  
    
    subtitle: function () {
        return this.isConnected() ? this.status() : "offline"
    },
    
    status: function() {
        var s = ""  
        var serverConnection = this.serverConnections()[0] 
        if (serverConnection) {
            s += this.remotePeerCount() + " remote peers"
        } else {
            return "connecting..."
        }
        return s
    }, 
    
    remotePeerCount: function() {
        return this.serverConnections().sum(function (p) {
            return p.remotePeers().length
            //return p.itemsLength()
        })
    },
    
    serverConnections: function () {
        return this.items()
    }, 
    
    connect: function () {
        //this.log("BMRServer.connect")
        this.serverConnection().connect()
        return this              
    },
    
    isConnected: function () {
        return this.serverConnection().isConnected()
    },
    
    broadcastMsg: function(msg) {        
        this.serverConnection().broadcastMsg(msg)
        return this
    },
    
    addrDict: function() {
        return { host: this.host(), port: this.port() }
    },
    
    setAddrDict: function(dict) {
        this.setHost(dict.host).setPort(dict.port)
        return this
    },
    
    isAddrDict: function(addrDict) {
        return this.host()== addrDict.host && this.port() == addrDict.port 
    },
    
    connectedRemotePeers: function () {
        return this.serverConnection().connectedRemotePeers()
    },

	updateBloomDistance: function(bloomUint8Array) {
		var hostHashUint8Array = this.host().sha256()

		// make sure host bits are at least as long as bloom
		while (hostHashUint8Array.length < bloomUint8Array.length) {
			hostHashUint8Array = hostHashUint8Array.concat(hostHashUint8Array)
		}
		
		// TODO: shouldn't need to calculate this often but 
		// might when server count gets high or changes frequently. Optimize then.
		
		var s1 = new BitStream(bloomUint8Array);
		var s2 = new BitStream(hostHashUint8Array);
		
		var bitCount = hostHashUint8Array.length * 8
		var diff = 0
		for (var i = 0; i < bitCount; i ++) {
			if (s1.readBoolean() != s2.readBoolean()) {
				diff ++
			}
		}
		
		this.setBloomDistance(diff)
		return this
	},    
})
