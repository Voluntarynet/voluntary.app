
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
	statusLog: null,
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
    },

	/*
	loadFinalize: function() {
		this.createSubnodeIndex()
	},
	*/
    
    addLog: function(s, error) {
        var statusNode = BMFieldSetNode.clone().setTitle(s).setSubtitle(new Date().toString())
        //this.statusLog().addSubnode(statusNode)
        statusNode.error = function () { return this._error }
        statusNode._error = ""
        
        if (error) {	        
	        statusNode._error = StackTrace.clone().stringForError(error)
	        statusNode.setNote("&gt;")
	        //statusNode.makeNoteRightArrow()
	    }
	    
        //var entry = BMDataStoreRecord.clone().setNodeColumnBackgroundColor("white").setNodeMinWidth(300)
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
		var peerId = BMPeerId.clone()
		peerId.setPublicKeyString(this.sessionId().publicKeyString())
		peerId.setBloomFilter(BMNetwork.shared().idsBloomFilter())
		//this.log("currentPeerId = '" + peerId.toString() + "'")
		return peerId
	},
			
    connect: function () {
        // TODO: add timeout and tell server when it occurs

        if (!this._serverConn) {
            this.setStatus("connecting...")
            this.setTitle("Connection")
			
			this.setPeerId(this.currentPeerId())
			
			try {
                this._serverConn = new Peer(this.peerId().toString(), this.serverConnectionOptions())                
                //this._serverConn = new Peer(this.serverConnectionOptions())
            } catch(e) {
                this.onError(e)
                return this
            }
            
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
				var remotePeer = this.remotePeers().addRemotePeerForId(aConn.peer)
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
        this.remotePeers().closeAll()
        
		//this.remotePeers().forEach((peer) => { peer.close() })
		//this.removeAllSubnodes()
		
		if (this._serverConn) {
			this._serverConn.disconnect()
			this._serverConn = null
		}
        this.setStatus("offline")
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
            console.log(this.type() + " " + s)
        }
        return this
    },
*/

    onError: function(error) {
		this.setError(error)
		if (!error.message.beginsWith("Could not connect to peer")) {
	        this.setStatus(error.message, error)	        
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
        this.log(this.type() + ".onClose " + err)
        this.setStatus("closed")
        if (err) {
            this.setLastError("close error: " + err)
        }
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
        var d = this.delegate()
        if (d && d.receivedMsgFrom) {
            d.receivedMsgFrom.apply(d, [msg, remotePeer])
        }
    },
    
    connectedRemotePeers: function () {
        return this.remotePeers().connectedRemotePeers()
    },
})



