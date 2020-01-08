"use strict"

/*

    BMRServer

    A Rendezvous Server.

*/


window.BMRServer = class BMRServer extends BMFieldSetNode {
    
    initPrototype () {
        this.newSlot("serverConnection", null)
        this.newSlot("bloomDistance", null)
        this.newSlot("error", null)
        this.newSlot("connectButton", null)

        // host: "peers.bitmarkets.org",
        this.newSlot("host", "127.0.0.1").setShouldStoreSlot(true)
        this.newSlot("port", 9000).setShouldStoreSlot(true)
        this.newSlot("path", "").setShouldStoreSlot(true)
        this.newSlot("isSecure", false).setShouldStoreSlot(true)
        
        this.setIsDebugging(true)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
        this.setShouldStoreSubnodes(false)
        this.setCanDelete(true)
        this.setNodeMinWidth(500)
    }

    init () {
        super.init()

        this.setServerConnection(BMServerConnection.clone().setServer(this))
        //this.addSubnode(this.serverConnection())
        //this.setTitle("RTC Server")
	
        this.addField(BMField.clone().setKey("host").setValueMethod("host"))
        this.addField(BMNumberField.clone().setKey("port").setValueMethod("port").setValueIsEditable(true))
        this.addField(BMField.clone().setKey("path").setValueMethod("path"))
        this.addField(BMBooleanField.clone().setKey("isSecure").setValueMethod("isSecure").setValueIsEditable(true))
        //this.addField(BMPointerField.clone().setKey("serverConnection").setValueMethod("serverConnection").)
        this.addField(BMPointerField.clone().setKey("serverConnection").setValueMethod("serverConnection"))
		
        this.setConnectButton(BMActionNode.clone().setTitle("connect").setMethodName("connect").setTarget(this))
        this.addSubnode(this.connectButton())
    }

    didUpdateNode () {
        super.didUpdateNode()
        //this.debugLog(".didUpdateNode()")
        this.updateButtons()
        return this
    }
    
    updateButtons () {
        const cb = this.connectButton()
        if (cb) {
            if (this.serverConnection().isConnected()) {
                cb.setTitle("disconnect").setMethodName("disconnect")
            } else {
                cb.setTitle("connect").setMethodName("connect")
            }
        }
    }
    
    servers () {
        return this.parentNode()
    }
    
    /*
    setPort (aPort) {
        this._port = aPort
        if (this._port === 443) {
            this.setIsSecure(true)
        }
        return this
    }
    */

    title () {
        //return "RTC Server " + this.host() + "  " + this.port()
        return " [" + this.host() + "]  (" + this.port() + ")"
    }
    
    subtitle () {
        return this.isConnected() ? this.status() : "offline"
    }
    
    status () {
        if (this.serverConnection().isConnected()) {
            const total = this.serverConnection().remotePeers().count()
            const connected = this.connectedRemotePeerCount()
            if (total === 0) {
                return "no peers"
            }
            return connected + "/" + total + " peers connected"
        } 

        if (this.serverConnection().error()) {
            return this.serverConnection().error()
        }

        return "connecting..."
    }
    
    connectedRemotePeerCount () {
        return this.serverConnection().connectedRemotePeers().length
    }
    
    connect () {
        //this.log("BMRServer.connect")
        this.serverConnection().connect()
        return this              
    }
    
    disconnect () {
        this.serverConnection().close()
        return this          
    }

    reconnect () {
        this.serverConnection().reconnect()
        return this		
    }
    
    reRequestPeerId () {
        this.serverConnection().requestId();
    }
    
    isConnected () {
        return this.serverConnection().isConnected()
    }
    
    broadcastMsg (msg) {        
        this.serverConnection().broadcastMsg(msg)
        return this
    }
    
    addrDict () {
        return { host: this.host(), port: this.port(), path: this.path(), isSecure: this.isSecure() }
    }
    
    setAddrDict (dict) {
        this.setHost(dict.host);
        this.setPort(dict.port);
        this.setPath(dict.path);
        this.setIsSecure(dict.isSecure);
        //if (dict.hasOwnProperty("path")) { this.setPath(dict.path); }
        //if (dict.hasOwnProperty("isSecure")) { this.setIsSecure(dict.isSecure); }
        return this
    }
    
    isAddrDict (addrDict) {
        return  this.host() === addrDict.host && 
                this.port() === addrDict.port &&
                this.path() === addrDict.path &&
                this.isSecure() === addrDict.isSecure
    }
    
    connectedRemotePeers () {
        return this.serverConnection().connectedRemotePeers()
    }

    connectedRemotePeers () {
        return this.serverConnection().connectedRemotePeers()

    }

    updateBloomDistance (bloomUint8Array) {
        const hostHashUint8Array = this.host().sha256()

        // make sure host bits are at least as long as bloom
        while (hostHashUint8Array.length < bloomUint8Array.length) {
            hostHashUint8Array = hostHashUint8Array.concat(hostHashUint8Array)
        }
		
        // TODO: shouldn't need to calculate this often but 
        // might when server count gets high or changes frequently. Optimize then.
		
        const s1 = new BitStream(bloomUint8Array);
        const s2 = new BitStream(hostHashUint8Array);
		
        const bitCount = hostHashUint8Array.length * 8
        let diff = 0
        for (let i = 0; i < bitCount; i ++) {
            if (s1.readBoolean() !== s2.readBoolean()) {
                diff ++
            }
        }
		
        this.setBloomDistance(diff)
        return this
    }
    
}.initThisClass()
