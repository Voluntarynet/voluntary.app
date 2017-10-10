
"use strict"

window.BMRemotePeer = BMNode.extend().newSlots({
    type: "BMRemotePeer",
    conn: null,
    serverConnection: null,
    messages: null,
    status: null,
    remoteInventory: null,
	peerId: null,
    debug: false,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setTitle("Peer")
        
        this.setMessages(BMNode.clone().setTitle("messages").setNoteIsSubnodeCount(true))
        this.addSubnode(this.messages())
        this.setRemoteInventory({})
		this.setPeerId(BMPeerId.clone())
    },

	setPeerIdString: function(id) {
		//this.log(.setPeerIdString(" + id + ")")
	 	this.peerId().setFromString(id)
		this.updateTitle()
		return this
	},
	
	hash: function() {
		return this.peerId().toString()
	},
    
    log: function(s) {
		if(this.debug()) {
        	console.log(this.fullShortId() + " " + s)
		}
        return this
    },
    
    network: function() {
        //return this.parentNodeOfType("BMNetwork")
        return this.serverConnection().server().servers().network()
    },
    
    id: function () {
        return this.conn().peer
    },

    shortId: function() {
        return this.hash().substring(0, 3)
    },

	fullShortId: function() {
		return "RemotePeer " + this.shortId()
	},
    
    subtitle: function () {
        return this.status()
    },   
    
    addMessage: function (msg) {
        return this.messages().addSubnode(msg)
    },

	setStatus: function(s) {
		this._status = s
		//this.log(this.typeId() + ".setStatus(" + s + ")")
		this.scheduleSyncToView()
		return this
	},
	
	updateTitle: function() {
        this.setTitle("Peer " + this.shortId())
		this.scheduleSyncToView()
	},

    connect: function() {
        if (!this.isConnected()) {
			var id = this.hash()
            this.log(".connect()")
			this.setStatus("connecting...")
            try {
                var dataConnection = this.serverConnection().serverConn().connect(id, this.peerConnectionOptions());
                this.setConn(dataConnection)
            } catch (error) {
                this.log("ERROR on BMServerConnection.connectToPeerId('" + this.shortId() + "')")
                console.error("    " + error.message )
            }
        }
		return this
    },

	// --- peer connection options -------------------
	// todo: move to BMRemotePeer
	
    peerConnectionOptions: function () {
        return { 
				// label: "",
				// metadata: {},
				//serialization: "json",
				reliable: true,
            }
    },

    setConn: function (aConn) {
        this._conn = aConn
        this.setStatus("connecting...")
        this.log("connecting")
        this.updateTitle()
                    
        if (this._conn) {
            this._conn.on('open', () => { this.onOpen() })
            this._conn.on('error', (err) => { this.onError(err) })
        }

        this.startConnectTimeout()
        
        return this
    },
    
    startConnectTimeout: function () {
        var timeoutSeconds = 45
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
    },
    
    close: function() {
		this.log("close")
        this._conn.close()
        this.setStatus("closed")
        return this 
    },
    
    isConnected: function () {
        return this.status() == "connected"
    },

    onOpen: function(c) {
        this.log("onOpen")
        this.setTitle("Peer " + this.shortId())
		this.peerId().setFromString(this.id())

        this.setStatus("connected")
        
        this._conn.on('data', (data) => { this.onData(data) })
        this._conn.on('close', (err) => { this.onClose(err) })

        //this.sendPing()
        this.network().onRemotePeerConnect(this)
    },

    onError: function(error) {
		this.log(" onError ", error)
        this.setStatus(error.message)
        this.log(" onError " + error)
    },

    onClose: function(err) {
        this.setStatus("closed")
        this.log("onClose " + err)
        this.serverConnection().onRemotePeerClose(this)
     },

    onData: function(data) {
        this.setStatus("connected")
        this.log("onData '" + data + "'")
        var msg = BMMessage.messageForString(data)
		this.log("onData msg.msgDict(): ", msg.msgDict())
        msg.setSubtitle("received")
        //msg.setSubtitle("via peer " + this.shortId())
        msg.setRemotePeer(this)
        this.log("onData msgType '" + msg.msgType() + "'")
		var msgType = msg.msgType()
		
        if (["ping", "pong", "addr", "inv", "getData", "object"].includes(msgType)) {
	        //this.addMessage(msg.duplicate())
			this.log(" applying " + msgType)
			this[msg.msgType()].apply(this, [msg])
		}
		
    },

    sendMsg: function(msg) {
        //msg.setSubtitle("sent to peer " + this.shortId())
        msg.setSubtitle("sent")
        //this.addMessage(msg.duplicate())
        this.sendData(msg.msgDictString())
    },
    
    sendData: function(data) {
        this.log("send '" + data + "'")
        this._conn.send(data)
        return this
    },
    
    // send messages
    
    sendPing: function() {
        this.sendMsg(BMPingMessage.clone())
        return this
    },
    
    sendPong: function() {
        this.sendMsg(BMPongMessage.clone())
        return this
    },

    // inventory

    markSeenHash: function(aHash) {
        this.remoteInventory()[aHash] = true
        return true
    },

    // receive messages
    
    ping: function(msg) {
        this.log("got ping")
        this.sendPong()
    },
    
    pong: function(msg) {
        this.log("got pong")
    },
    
    addr: function(msg) {
        this.log("got addr")
        this.network().addr(msg)
    },
    
    inv: function(msg) {
        this.log("got inv ")
        // TODO: track local inventory, 
        // blacklist if sender repeats any hashes
        this.network().messages().inv(msg)
        
        // mark these hashes as seen
        msg.data().forEach((hash) => {
            this.markSeenHash(hash)
        })
    },
    
    getData: function(msg) {
        this.log("got getData ")
        this.network().messages().getData(msg)
    },
    
    object: function(objMsg) {
		this.log("got object msg.msgDict(): ", objMsg.msgDict())
        //this.log("got object")
        
        var msgs = this.network().messages()
        
        if (msgs.validateMsg(objMsg)) {
			this.markSeenHash(objMsg.msgHash())
            msgs.object(objMsg)
        } else {
			this.log("received invalid object ")
            this.close()
            this.setStatus("error: received invalid object")
        }            
    },
    
    hasSeenMsgHash: function(aHash) {
        return aHash in this.remoteInventory()
    },
    
    addedObjMsg: function(msg) {
        if (!this.hasSeenMsgHash(msg.msgHash())) {
            this.sendMsg(msg)
        }
        return this
    },

	mayShareContacts: function() {
		return BMNetwork.shared().hasIdentityMatchingBloomFilter(this.peerId().bloomFilter())
    },

	connectIfMayShareContacts: function() {
		if ((!this.isConnected()) && this.mayShareContacts()) {
			//this.log(this.shortId() + " may share contacts - connecting")
			this.connect()
		} else {
			this.setStatus("no contact match")
		}
		return this
	},
})
