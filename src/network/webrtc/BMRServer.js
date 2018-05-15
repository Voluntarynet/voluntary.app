// A Rendezvous Server

"use strict"

window.BMRServer = BMFieldSetNode.extend().newSlots({
    type: "BMRServer",
   // host: 'peers.bitmarkets.org',
    host: '127.0.0.1',
    port: 9000,
    path: '',
    isSecure: false,
    serverConnection: null,
	bloomDistance: null,
	error: null,
	debug: true,
	connectButton: null,
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
		this.setShouldStore(true)
		this.setShouldStoreSubnodes(true)
		
        this.setServerConnection(BMServerConnection.clone().setServer(this))
        //this.addSubnode(this.serverConnection())
        //this.setTitle("RTC Server")
        this.addStoredSlots(["host", "port"])
        this.setShouldStoreSubnodes(false)
        this.addAction("delete")
        this.setNodeMinWidth(500)
	
		this.addStoredField(BMField.clone().setKey("host"))
		this.addStoredField(BMNumberField.clone().setKey("port").setValueIsEditable(true))
		this.addStoredField(BMField.clone().setKey("path"))
		this.addStoredField(BMBoolField.clone().setKey("isSecure").setValueIsEditable(true))
		//this.justAddField(BMPointerField.clone().setKey("serverConnection"))
		this.addSubnode(BMPointerField.clone().setKey("serverConnection"))
		
		this.setConnectButton(BMActionField.clone().setKey("connect").setValue("connect"))
		this.addSubnode(this.connectButton())
    },

    didUpdateNode: function() {
        BMFieldSetNode.didUpdateNode.apply(this)
        //console.log(this.type() + ".didUpdateNode()")
        this.updateButtons()
        return this
    },
    
    updateButtons: function() {
        var cb = this.connectButton()
        if (cb) {
            if (this.serverConnection().isConnected()) {
                cb.setKey("disconnect").setValue("disconnect")
            } else {
                cb.setKey("connect").setValue("connect")
            }
        }
    },
    
    servers: function () {
        return this.parentNode()
    },
    
    /*
    setPort: function(aPort) {
        this._port = aPort
        if (this._port == 443) {
            this.setIsSecure(true)
        }
        return this
    },
    */

    title: function () {
        //return "RTC Server " + this.host() + "  " + this.port()
        return this.host() + "  " + this.port()
    },  
    
    subtitle: function () {
        return this.isConnected() ? this.status() : "offline"
    },
    
    status: function() {
        if (this.serverConnection().isConnected()) {
            return "connected - " + this.remotePeerCount() + " peers"
        } 

		if (this.serverConnection().error()) {
			return this.serverConnection().error()
		}

        return "connecting..."
    }, 
    
    remotePeerCount: function() {
        return this.serverConnection().connectedRemotePeers().length
    },
    
    connect: function () {
        //this.log("BMRServer.connect")
        this.serverConnection().connect()
        return this              
    },
    
    disconnect: function() {
        this.serverConnection().close()
        return this          
    },

	reconnect: function() {
        this.serverConnection().reconnect()
        return this		
    },
    
    reRequestPeerId: function() {
        this.serverConnection().requestId();
    },
    
    isConnected: function () {
        return this.serverConnection().isConnected()
    },
    
    broadcastMsg: function(msg) {        
        this.serverConnection().broadcastMsg(msg)
        return this
    },
    
    addrDict: function() {
        return { host: this.host(), port: this.port(), path: this.path(), isSecure: this.isSecure() }
    },
    
    setAddrDict: function(dict) {
        this.setHost(dict.host);
        this.setPort(dict.port);
        this.setPath(dict.path);
        this.setIsSecure(dict.isSecure);
        //if ("path" in dict) { this.setPath(dict.path); }
        //if ("isSecure" in dict) { this.setIsSecure(dict.isSecure); }
        return this
    },
    
    isAddrDict: function(addrDict) {
        return  this.host() == addrDict.host && 
                this.port() == addrDict.port &&
                this.path() == addrDict.path &&
                this.isSecure() == addrDict.isSecure
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
