
BMServerConnection = BMNode.extend().newSlots({
    type: "BMServerConnection",
    server: null,
    serverConn: null,
    id: null,
    peerIds: null,
    remotePeers: null,
    delegate: null,
    lastError: null,
    privateKey: null,
    status: null,
	error: null,
    //log: null,
	sessionId: null,
	peerId: null,
	debug: true,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this._remotePeers = []
        this.setTitle("Connection")
        this.setNoteIsItemCount(true)
        //this.setViewClassName("GenericView")
        this.setNodeMinWidth(160)
        //this.setLog(BMNode.clone())

		this.setSessionId(BMLocalIdentity.clone().generatePrivateKey())
		this.setPeerId(BMPeerId.clone())
    },
    
    setStatus: function(s) {
        this._status = s
        this.setSubtitle(s)
        return this
    },

    shortId: function() {
         return this.id().substring(0, 6)
    },
    
    subtitle: function () {
        return this.status()
    },   
    
    items: function () {
        return this.remotePeers()
    },

	// --- server connection --------------------------
	
    serverConnectionOptions: function () {
		//console.log("BMNetwork.shared().stunServers().peerOptionsDict() = ", BMNetwork.shared().stunServers().peerOptionsDict())
        return { 
                host: this.server().host(), 
                port: this.server().port(),
				//path: null,
				//secure: true,
				config: BMNetwork.shared().stunServers().peerOptionsDict(),
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
            this.setStatus("connecting...")
            this.setTitle("Connection")
			
            this._serverConn = new Peer(this.currentPeerId().toString(), this.serverConnectionOptions())                
            //this._serverConn = new Peer(this.serverConnectionOptions())                
                      
            this._serverConn.on('open', (id) => { 
                this.setId(id) 
                this.onOpen()
            })
            
            this._serverConn.on('connection', (aConn) => { 
                //console.log("connection"); 
                this.addRemotePeerConn(aConn) 
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
        this.setStatus(error)
        this.log(this.type() + " onError: " + error);
        this._serverConn = null
        this.didUpdate()
    },
    
    onOpen: function() {
        this.setTitle("Connection " + this.shortId())
        this.setStatus("connected")
        this.log("onOpen " + this.id());
        this.updatePeerIds()
        this.didUpdate()
    },

    onClose: function(err) {
        //this.log("onClose " + err)
        this.setStatus("closed")

        this.setLastError("close error: " + err)
        this._serverConn = null
        //this.server().closedRemotePeer(this)
        this.didUpdate()
    },
    
    isConnected: function () {
        return this.serverConn() != null
    },

    onData: function(data) {
        //this.log("onData " + data)
    },

    // remote peers
    
    updatePeerIds: function() {
        //this.log("updatePeerIds");
        this.serverConn().listAllPeers((peerIds) => {
            this.setPeerIds(peerIds)
        })
    },

    setPeerIds: function (peerIds) {
        peerIds.remove(this.id())
        //this.log(" setPeerIds " + JSON.stringify(peerIds));
        this._peerIds = peerIds
        this.connectToAllPeerIds()
        return this
    },

    connectToAllPeerIds: function () {
        this.peerIds().forEach((peerId) => { this.connectToPeerId(peerId) })
        return this
    },

    isConnectedToPeerId: function(peerId) {
        return this.remotePeers().detect(function(peer) {
            peer.id() == peerId
        }) != null
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

    connectToPeerId: function(pid) {
        if (!this.isConnectedToPeerId(pid)) {
            //this.log("connectToPeerId " + pid)
            try {
                var dataConnection = this.serverConn().connect(pid, this.peerConnectionOptions());
                this.addRemotePeerConn(dataConnection)
            } catch (error) {
                console.log("ERROR on BMServerConnection.connectToPeerId('" + pid + "')")
                console.error("    " + error.message )
                //console.log( error.stack )
                //throw error
            }
        }
    },

    addRemotePeerConn: function(aConn) {
        this.log("addRemotePeerConn " + aConn.peer)
        var rp = BMRemotePeer.clone().setConn(aConn).setServerConnection(this)
        this.addItem(rp)
        //console.log("BMServerConnection addRemotePeerConn didUpdate --------------------")
        this.didUpdate()
        return this
    },

    onRemotePeerClose: function(remotePeer) {
        this.removeItem(remotePeer)
        this.didUpdate()
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



