
// A Rendezvous Server

BMRServer = BMStorableNode.extend().newSlots({
    type: "BMRServer",
   // host: 'peers.bitmarkets.org',
    host: '127.0.0.1',
    port: 9000,
    serverConnection: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setServerConnection(BMServerConnection.clone().setServer(this))
        this.addItem(this.serverConnection())
        //this.setTitle("RTC Server")
        this.addStoredSlots(["host", "port"])
        this.setShouldSerializeChildren(false)
        this.actions().appendIfAbsent("delete")
        this.setNodeMinWidth(160)
    },

    servers: function () {
        return this.parentNode()
    },

    title: function () {
        return "RTC Server " + this.host() + "  " + this.port()
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
        var self = this
        this.log("BMRServer.connect")
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
    
})
