"use strict"

/*

    BMRemotePeer

*/

window.BMRemotePeer = class BMRemotePeer extends BMNode {
    
    initPrototype () {
        this.newSlot("conn", null)
        this.newSlot("serverConnection", null)
        this.newSlot("messages", null)
        this.newSlot("status", null)
        this.newSlot("remoteInventory", null)
        this.newSlot("peerId", null)
    }

    init () {
        super.init()
        this.setTitle("Peer")
        
        this.setMessages(BMNode.clone().setTitle("messages").setNoteIsSubnodeCount(true))
        this.addSubnode(this.messages())
        this.setRemoteInventory({})
        this.setPeerId(BMPeerId.clone())
    }

    setPeerIdString (id) {
        //this.log(.setPeerIdString(" + id + ")")
	 	this.peerId().setFromString(id)
        this.updateTitle()
        return this
    }
	
    hash () {
        return this.peerId().toString()
    }
    
    log (s) {
        if(this.isDebugging()) {
        	console.log(this.fullShortId() + " " + s)
        }
        return this
    }
    
    network () {
        //return this.parentNodeOfType("BMNetwork")
        return this.serverConnection().server().servers().network()
    }

    shortId () {
        return this.hash().substring(0, 3)
    }

    fullShortId () {
        return "RemotePeer " + this.shortId()
    }
    
    subtitle () {
        return this.status()
    }
    
    addMessage (msg) {
        return this.messages().addSubnode(msg)
    }

    setStatus (s) {
        this._status = s
        //this.log(this.typeId() + ".setStatus(" + s + ")")
        this.didUpdateNode()
        return this
    }
	
    updateTitle () {
        this.setTitle("Peer " + this.shortId())
        this.scheduleSyncToView()
    }

    connect () {
        if (!this.isConnected()) {
            this.log(".connect()")
            this.setStatus("connecting...")

            try {
                this.setConn(new SimplePeer({
                    initiator: true,
                    config: BMStunServers.defaultOptions()
                }));
            } catch (error) {
                this.log("ERROR on BMServerConnection.connectToPeerId('" + this.shortId() + "')")
                console.error(error);
            }
        }
        return this
    }

    // --- peer connection options -------------------
    // TODO: move to BMRemotePeer
	
    peerConnectionOptions () {
        return { 
            // label: "",
            // metadata: {},
            //serialization: "json",
            reliable: true,
        }
    }

    setConn (aConn) {
        this._conn = aConn
        this.setStatus("connecting...")
        this.log("connecting")
        this.updateTitle()
                    
        if (this._conn) {
            this._conn.on("connect", () => { this.onOpen() })
            this._conn.on("error", (err) => { this.onError(err) })
            this.conn().on("signal", signal => {
                this.serverConnection().send("signalToPeer", { signal: signal, toPeer: this.peerId().toString()  }).catch((e) => this.onError(e));
            });
        }

        this.startConnectTimeout()
        
        return this
    }
    
    startConnectTimeout () {
        const timeoutSeconds = 45
        setTimeout(() => { 
            if (!this.isConnected()) {
                this.log(" connection timeout")
                this.close()
                this.setStatus("connect timeout")
                this.didUpdateNode()
                this.serverConnection().onRemotePeerClose(this)
                this.log("connect timeout")
            }   
        }, timeoutSeconds*1000)        
    }
    
    close () {
        if (this._conn) {
    		this.log("close")
            this._conn.destroy()
            this.setStatus("closed")
        } else {
            //console.warn(this.typeId() + ".close() sent to closed connection")
        }
        return this 
    }
    
    isConnected () {
        return this.status() === "connected"
    }

    onOpen (c) {
        this.log("onOpen")
        this.setTitle("Peer " + this.shortId())

        this.setStatus("connected")
        
        this._conn.on("data", (data) => { this.onData(data) })
        this._conn.on("close", (err) => { this.onClose(err) })

        //this.sendPing()
        this.network().onRemotePeerConnect(this)
    }

    onError (error) {
        this.log(" onError ", error)
        this.setStatus(error.message)
        this.log(" onError " + error)
    }

    onClose (err) {
        this.setStatus("closed")
        this.log("onClose " + err)
        this.serverConnection().onRemotePeerClose(this)
    }

    onData (data) {
        this.setStatus("connected")
        this.log("onData '" + data + "'")
        const msg = BMMessage.messageForString(data)
        this.log("onData msg.msgDict(): ", msg.msgDict())
        msg.setSubtitle("received")
        //msg.setSubtitle("via peer " + this.shortId())
        msg.setRemotePeer(this)
        this.log("onData msgType '" + msg.msgType() + "'")
        const msgType = msg.msgType()
		
        if (["ping", "pong", "addr", "inv", "getData", "object"].includes(msgType)) {
	        //this.addMessage(msg.duplicate())
            this.log(" applying " + msgType)
            this[msg.msgType()].apply(this, [msg])
        }
		
    }

    sendMsg (msg) {
        //msg.setSubtitle("sent to peer " + this.shortId())
        msg.setSubtitle("sent")
        //this.addMessage(msg.duplicate())
        this.sendData(msg.msgDictString())
    }
    
    sendData (data) {
        this.log("send '" + data + "'")
        this._conn.send(data)
        return this
    }
    
    // send messages
    
    sendPing () {
        this.sendMsg(BMPingMessage.clone())
        return this
    }
    
    sendPong () {
        this.sendMsg(BMPongMessage.clone())
        return this
    }

    // inventory

    markSeenHash (aHash) {
        this.remoteInventory().atPut(aHash, true)
        return true
    }

    // receive messages
    
    ping (msg) {
        this.log("got ping")
        this.sendPong()
    }
    
    pong (msg) {
        this.log("got pong")
    }
    
    addr (msg) {
        this.log("got addr")
        this.network().addr(msg)
    }
    
    inv (msg) {
        this.log("got inv ")
        // TODO: track local inventory, 
        // blacklist if sender repeats any hashes
        this.network().messages().inv(msg)
        
        // mark these hashes as seen
        msg.data().forEach((hash) => {
            this.markSeenHash(hash)
        })
    }
    
    getData (msg) {
        this.log("got getData ")
        this.network().messages().getData(msg)
    }
    
    object (objMsg) {
        this.log("got object msg.msgDict(): ", objMsg.msgDict())
        //this.log("got object")
        
        const msgs = this.network().messages()
        
        if (msgs.validateMsg(objMsg)) {
            this.markSeenHash(objMsg.msgHash())
            msgs.object(objMsg)
        } else {
            this.log("received invalid object ")
            this.close()
            this.setStatus("error: received invalid object")
        }            
    }
    
    hasSeenMsgHash (aHash) {
        return this.remoteInventory().hasOwnProperty(aHash)
    }
    
    addedObjMsg (msg) {
        if (!this.hasSeenMsgHash(msg.msgHash())) {
            this.sendMsg(msg)
        }
        return this
    }

    mayShareContacts () {
        return BMNetwork.shared().hasIdentityMatchingBloomFilter(this.peerId().bloomFilter())
    }

    connectIfMayShareContacts () {
        if ((!this.isConnected()) && this.mayShareContacts()) {
            //this.log(this.shortId() + " may share contacts - connecting")
            this.connect()
        } else {
            this.setStatus("no contact match")
        }
        return this
    }
    
}.initThisClass()
