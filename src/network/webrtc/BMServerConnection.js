"use strict"

/*

    BMServerConnection

*/

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
    statusLog: null,
    pendingMessages: null,
    isOpen: false,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        //this._remotePeers = []
       
        this.setRemotePeers(BMRemotePeers.clone())
        this.addSubnode(this.remotePeers())

        this.setStatusLog(BMNode.clone().setTitle("log").setNodeMinWidth(300))
        this.addSubnode(this.statusLog())
        this.statusLog().addAction("deleteAll")
        this.statusLog().deleteAll = function() {
            this.removeAllSubnodes()
        }
        
        this.setTitle("Server Connection")
        this.setNoteIsSubnodeCount(false)
        //this.setViewClassName("GenericView")
        //this.setLog(BMNode.clone())

        this.setSessionId(BMKeyPair.clone().generatePrivateKey())
        this.setPeerId(BMPeerId.clone())
        //this.createSubnodeIndex()

        this.setPendingMessages({});
    },

    /*
	loadFinalize: function() {
		this.createSubnodeIndex()
	},
	*/
    
    addLog: function(s, error) {
        let statusNode = BMFieldSetNode.clone().setTitle(s).setSubtitle(new Date().toString())
        //this.statusLog().addSubnode(statusNode)
        statusNode.error = function () { return this._error }
        statusNode._error = ""
        
        if (error) {	        
	        statusNode._error = StackTrace.shared().stringForError(error)
	        statusNode.setNote("&gt;")
	        //statusNode.makeNoteRightArrow()
	    }
	    
        //let entry = BMDataStoreRecord.clone().setNodeColumnBackgroundColor("white").setNodeMinWidth(300)
        statusNode.addStoredField(BMTextAreaField.clone().setKey("dict").setValueMethod("error").setValueIsEditable(false).setIsMono(true))
        //entry.setTitle(s)
        //entry.setSubtitle(new Date().toString())
        //entry.setValue(s)
        this.statusLog().addSubnode(statusNode)
    },

    setStatus: function(s, error) {
        //console.warn(this.typeId() + ".setStatus(" + s + ")")
        
        this._status = s
        this.setSubtitle(s)
        
        this.addLog(s, error)
        
        //this.scheduleSyncToView()
        this.didUpdateNode() 
        this.server().didUpdateNode() 
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
    
    /*
    subnodes: function () {
        return this.remotePeers()
    },
    */

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
        let peerId = BMPeerId.clone()
        peerId.setPublicKeyString(this.sessionId().publicKeyString())
        peerId.setBloomFilter(BMNetwork.shared().idsBloomFilter())
        //this.log("currentPeerId = '" + peerId.toString() + "'")
        return peerId
    },

    serverConnUrl: function() {
        return "ws" + (this.server().isSecure() ? "s" : "") + "://" + this.server().host() + ":" + this.server().port();
    },
			
    connect: function () {
        // TODO: add timeout and tell server when it occurs

        if (!this._serverConn) {
            this.setStatus("connecting...")
            this.setTitle("Connection")
			
            this.setPeerId(this.currentPeerId())
			
            try {
                this._serverConn = new WebSocket(this.serverConnUrl());
            } catch(e) {
                this.onError(e)
                return this
            }
            
            this.log("Server " +  this.shortId() + ".connect()")

            this._serverConn.addEventListener("open", e => {
                this.onOpen();
            });

            this._serverConn.addEventListener("close", e => {
                this.onClose();
            });

            this._serverConn.addEventListener("error", e => {
                this.onError(e.data);
            });
            
            this._serverConn.addEventListener("message", event => {
                try {
                    //console.log("BMServerConnection receive: " + event.data);
                    const msg = JSON.parse(event.data);
                    this.perform("receive" + msg.name.capitalized(), msg.data);
                }
                catch (error) {
                    this.onError(error);
                }
            });
        }

        return this;
    },

    receiveResponse(response) {
        const pendingMessage = this.pendingMessages()[response.id];
        if (pendingMessage) {
            delete this.pendingMessages()[response.id];
            if (response.error) {
                pendingMessage.reject(response.error);
            }
            else {
                pendingMessage.resolve(response.result);
            }
        }
        else {
            this.onError("Received invalid response: " + JSON.stringify(msg));
        }
    },

    receiveSignalFromPeer(data) {
        let remotePeer = this.remotePeers().subnodes().detect(p => p.peerId().toString() == data.fromPeer);
        if (remotePeer == null) {
            remotePeer = this.remotePeers().addRemotePeerForId(data.fromPeer);
            remotePeer.setConn(new SimplePeer({
                initiator: false,
                config: BMStunServers.defaultOptions()
            }));
        }
        remotePeer.conn().signal(data.signal);
    },

    reconnect: function() {
        //console.log(this.typeId() + ".reconnect()")
        this.close()
        return this;
    },
	
    close: function() {
        this.setStatus("closing...")
        this.remotePeers().closeAll()
        clearInterval(this._pingInterval);
        //this.remotePeers().forEach((peer) => { peer.close() })
        //this.removeAllSubnodes()
		
        if (this._serverConn) {
            this._serverConn.removeEventListeners();
            this._serverConn.close()
            this._serverConn = null
        }
        this.setStatus("offline")

        this.onClose();
        return this
    },

    showPeers: function() {
	    this.remotePeers().showPeers()
	    /*
		console.log(this.typeId() + ".showPeers()")
		this.subnodes().forEach((peer) => {
			console.log("    ", peer.hash())
		})
		*/
    },
  
    /*  
    log: function(s) {
        if (this.debug()) {
            console.log(this.typeId() + " " + s)
        }
        return this
    },
*/

    onError: function(error) {
        if (typeof(error) === "undefined") {
            // closed connection?
            return
        }


        console.error(this.typeId() + " ERROR: ", error);
        this.setError(error)
        if (error && !error.message.beginsWith("Could not connect to peer")) {
	        this.setStatus(error.message, error)	        
            this.log(this.type() + " onError: " + error);
            if (this._serverConn) {
                this._serverConn.removeEventListeners();
                this._serverConn = null
            }
        }
    },
    
    onOpen: function() {
        this.setIsOpen(true)
        this.setTitle("Connection " + this.shortId())
        this.setStatus("connected")
        this.log("onOpen " + this.peerId().toString());
        this._pingInterval = setInterval(() => {
            this.send("ping");
        }, 15000);
        this.requestId();
        
        
    },

    requestId: function() {
        if (this.isOpen()) {
            this.setPeerId(this.currentPeerId());
            return this.send("requestId", { requestedId: this.peerId().toString() }).then(() => {
                this.updatePeers();
            }).catch(e => this.onError(e));
        }
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
        this.setIsOpen(false)
        clearInterval(this._pingInterval);
        this.log(this.type() + ".onClose " + err)
        this.setStatus("closed")
        if (err) {
            this.setLastError("close error: " + err)
        }

        if (this._serverConn) {
            this._serverConn.removeEventListeners();
            this._serverConn = null;
        }
    },
    
    isConnected: function () {
        return this.isOpen()
        //return this.serverConn() != null
    },

    //returns a Promise
    send: function(name, data) {
        const msg = BMServerMessage.clone();
        msg.setServerConnection(this);
        msg.setName(name);
        msg.setData(data);
        return msg.send();
    },

    /*
    onData: function(data) {
        //this.log("onData " + data)
    },
*/

    // remote peers
    
    updatePeers: function() {
        //this.log("updatePeers");
        this.send("listAllPeers")
            .then((peerIds) => this.setPeerIds(peerIds))
            .catch((e) => this.onError(e));
    },

    setPeerIds: function(ids) {
        //console.log(this.typeId() + ".setPeerIds(\n" + ids.join("\n") + "\n)")		
        ids.remove(this.peerId().toString())
        this.remotePeers().setPeerIds(ids)
        //this.connectToMatchingPeerIds()
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
        this.remotePeers().subnodes().forEach((remotePeer) => { 
            //console.log("remotePeer = ", remotePeer)
            remotePeer.sendMsg(msg)
        })
        return this
    },
    
    receivedMsgFrom: function(msg, remotePeer) {
        let d = this.delegate()
        if (d && d.receivedMsgFrom) {
            d.receivedMsgFrom.apply(d, [msg, remotePeer])
        }
    },
    
    connectedRemotePeers: function () {
        return this.remotePeers().connectedRemotePeers()
    },

    connectedRemotePeerCount: function() {
        return this.remotePeers().connectedRemotePeers().length
    },

    remotePeersCount : function() {
        return this.remotePeers().count()
    },
})



