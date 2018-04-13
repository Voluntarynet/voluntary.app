
"use strict"

window.BMServerConnection = BMNode.extend().newSlots({
    type: "BMServerConnection",
    server: null,
    serverConn: null,
    peerId: null,
    remotePeers: null,
    delegate: null,
    lastError: null,
    privateKey: null,
    status: "not connected",
	error: null,
    //log: null,
	sessionId: null,
	debug: false,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this._remotePeers = []
        this.setTitle("Server Connection")
        this.setNoteIsSubnodeCount(true)
        //this.setViewClassName("GenericView")
        //this.setLog(BMNode.clone())

		this.setSessionId(BMKeyPair.clone().generatePrivateKey())
		this.setPeerId(BMPeerId.clone())
		this.createSubnodeIndex()
    },

	/*
	loadFinalize: function() {
		this.createSubnodeIndex()
	},
	*/
    
    setStatus: function(s) {
		//console.warn(this.typeId() + ".setStatus(" + s + ")")
        this._status = s
        this.setSubtitle(s)
		this.scheduleSyncToView()
		this.didUpdateNode()
        return this
    },

    shortId: function() {
        if (this.peerId()) {
            return this.peerId().toString().substring(0, 3)
        }
        return "-"
    },
    
    subtitle: function () {
        return this.status()
    },   
    
    subnodes: function () {
        return this.remotePeers()
    },

	// --- server connection --------------------------
	
    serverConnectionOptions: function () {
		//console.log("BMNetwork.shared().stunServers().peerOptionsDict() = ", BMNetwork.shared().stunServers().peerOptionsDict())
        return { 
                host: this.server().host(), 
                port: this.server().port(),
				path: this.server().path(),
				secure: this.server().isSecure(),
				//config: BMNetwork.shared().stunServers().peerOptionsDict(),
                //config: this.defaultConfig()
                //debug: 3, 
            }
    },

	// --- connection id ----
	
	currentPeerId: function() {
		var peerId = BMPeerId.clone()
		peerId.setPublicKeyString(this.sessionId().publicKeyString())
		peerId.setBloomFilter(BMNetwork.shared().idsBloomFilter())
		//this.log("currentPeerId = '" + peerId.toString() + "'")
		return peerId
	},
			
    connect: function () {
        // TODO: add timeout and tell server when it occurs

        if (!this._serverConn) {
            //this.log("connecting...");
            this.setStatus("connecting to server...")
            this.setTitle("Connection")
			
			this.setPeerId(this.currentPeerId())
			
            this._serverConn = new Peer(this.peerId().toString(), this.serverConnectionOptions())                
            //this._serverConn = new Peer(this.serverConnectionOptions())
            
            this.log("Server " +  this.shortId() + ".connect()")          
            
            this._serverConn.on('open', (id) => { 
                var sid = this.peerId().toString()
                if(sid != id) {
                    console.log(sid + " != ", id)
                    throw newError(this.typeId() + " peerId doesn't match our id from the server")
                }
                this.onOpen()
            })
            
            this._serverConn.on('connection', (aConn) => { 
                console.log(this.typeId() + " connection event aConn.peer=" + aConn.peer); 
                //this.addRemotePeerConn(aConn) 
				var remotePeer = this.addRemotePeerForId(aConn.peer)
				remotePeer.setConn(aConn)
            })
            
            this._serverConn.on('error', (error) => { 
                this.onError(error)
            })  
            
            this._serverConn.on('close', (error) => { 
                this.log("close with error: " + error); 
                this.onClose(error)
            }) 
        }

        return this              
    },

	reconnect: function() {
	    //console.log(this.typeId() + ".reconnect()")
        this.close()
		this.connect()
        return this		
	},
	
	close: function() {
        this.setStatus("closing...")
		this.remotePeers().forEach((peer) => { peer.close() })
		this.removeAllSubnodes()
		if (this._serverConn) {
			this._serverConn.disconnect()
			this._serverConn = null
		}
		return this
	},

	showPeers: function() {
		console.log(this.typeId() + ".showPeers()")
		this.subnodes().forEach((peer) => {
			console.log("    ", peer.hash())
		})
	},
  
/*  
    log: function(s) {
        if (this.debug()) {
            console.log(this.type() + " " + s)
        }
        return this
    },
*/

    onError: function(error) {
		this.setError(error)
		if (!error.message.beginsWith("Could not connect to peer")) {
	        this.setStatus(error.message)
	        this.log(this.type() + " onError: " + error);
	        this._serverConn = null
		}
    },
    
    onOpen: function() {
        this.setTitle("Connection " + this.shortId())
        this.setStatus("connected")
        this.log("onOpen " + this.peerId().toString());
        this.updatePeers()
    },

/*
	scheduleUpdatePeers: function() {
		if (!this._hasScheduledUpdatePeers) {
			this.__hasScheduledUpdatePeers = true
			setTimeout(() => {
				if (this.isConnected()) {
					this.__hasScheduledUpdatePeers = false
					this.updatePeers()
					this.scheduleUpdatePeers()
				}
			}, 60*5)
		}
	},
*/

    onClose: function(err) {
        //this.log("onClose " + err)
        this.setStatus("closed")
        this.setLastError("close error: " + err)
        this._serverConn = null
    },
    
    isConnected: function () {
        return this.serverConn() != null
    },

/*
    onData: function(data) {
        //this.log("onData " + data)
    },
*/

    // remote peers
    
    updatePeers: function() {
        //this.log("updatePeers");
		
        this.serverConn().listAllPeers((ids) => {
			this.setPeerIds(ids)
        })
    },

	setPeerIds: function(ids) {
		//console.log(this.typeId() + ".setPeerIds(\n" + ids.join("\n") + "\n)")
		
		ids.remove(this.peerId().toString())
		
		// remove peers not in ids
		this.remotePeers().forEach((peer) => {
			if(!ids.contains(peer.hash())) {
				if (!peer.isConnected()) {
					this.removeSubnode(peer)
				}
			}
		})
		
		// add a peer for each new id
		ids.forEach((id) => {
			if (!this.hasSubnodeWithHash(id)) {
				this.addRemotePeerForId(id)
			}
		})
		
        this.connectToMatchingPeerIds()
	},
	
	addRemotePeerForId: function(id) {
		var peer = this.subnodeWithHash(id)
		if (!peer) {
		 	peer = BMRemotePeer.clone().setPeerIdString(id).setServerConnection(this)
			this.addSubnode(peer)
		}
		return peer
	},
    
    connectToMatchingPeerIds: function () {
        this.remotePeers().forEach((remotePeer) => { 
			// TODO: add max connections limit? 
			// have peer limit overly friendly blooms?
			remotePeer.connectIfMayShareContacts() 
		})
        return this
    },

/*    
    connectToAllPeerIds: function () {
        this.peerIds().forEach((peerId) => { this.connectToPeerId(peerId) })
        return this
    },
*/

    onRemotePeerClose: function(remotePeer) {
        //this.removeSubnode(remotePeer)
        return this
    },
    
    broadcastMsg: function(msg) {
        //this.log("broadcastMsg " + msg)
        this.remotePeers().forEach(function (remotePeer) { 
            //console.log("remotePeer = ", remotePeer)
            remotePeer.sendMsg(msg)
        })
        return this
    },
    
    receivedMsgFrom: function(msg, remotePeer) {
        var d = this.delegate()
        if (d && d.receivedMsgFrom) {
            d.receivedMsgFrom.apply(d, [msg, remotePeer])
        }
    },
    
    connectedRemotePeers: function () {
        return this.remotePeers().filter(function (remotePeer) {
            return remotePeer.isConnected()
        })        
    },
})



