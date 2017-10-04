
"use strict"

window.BMServerConnection = BMNode.extend().newSlots({
    type: "BMServerConnection",
    server: null,
    serverConn: null,
    peerId: null,
    remotePeerIds: null,
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
    },
    
    setStatus: function(s) {
        this._status = s
        this.setSubtitle(s)
        return this
    },

    shortId: function() {
        if (this.peerId()) {
            return this.peerId().toString().substring(0, 6)
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
				//path: null,
				//secure: true,
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
            this.setStatus("connecting...")
            this.setTitle("Connection")
			
			this.setPeerId(this.currentPeerId())
			
            this._serverConn = new Peer(this.peerId().toString(), this.serverConnectionOptions())                
            //this._serverConn = new Peer(this.serverConnectionOptions())
            
            console.log("connecting with local peerIdString ", this.peerId().toString())          
                      
            this._serverConn.on('open', (id) => { 
                this.setLocalPeerIdString(id) 
                assert(this.peerId().toString() == BMPeerId.clone().setFromString(id).toString())
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
        this.didUpdateNode()
    },
    
    onOpen: function() {
        this.setTitle("Connection " + this.shortId())
        this.setStatus("connected")
        this.log("onOpen " + this.peerId().toString());
        this.updatePeerIds()
        this.didUpdateNode()
    },

    onClose: function(err) {
        //this.log("onClose " + err)
        this.setStatus("closed")
        this.setLastError("close error: " + err)
        this._serverConn = null
        this.didUpdateNode()
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
        this.serverConn().listAllPeers((ids) => {
            ids.remove(this.peerId().toString())

            var peerIds = ids.map((id) => {
                return BMPeerId.clone().setFromString(id)
            })
            this.setPeerIds(peerIds)
        })
    },

    setPeerIds: function (peerIds) {
        //this.log(" setPeerIds " + JSON.stringify(peerIds));
        this._peerIds = peerIds
        this.connectToMatchingPeerIds()
        return this
    },

    matchingPeerIds: function() {
        return this.peerIds().filter((rpid) => {
            return BMNetwork.shared().hasIdentityMatchingBloomFilter(rpid.bloomFilter())
        })
    },
    
    connectToMatchingPeerIds: function () {
        this.matchingPeerIds().forEach((rpid) => { this.connectToPeerId(rpid) })
        return this
    },
    
    connectToAllPeerIds: function () {
        this.peerIds().forEach((peerId) => { this.connectToPeerId(peerId) })
        return this
    },

    isConnectedToPeerId: function(peerId) {
        return this.remotePeers().detect(function(peer) {
            return peer.peerId().equals(peerId)
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
        this.addSubnode(rp)
        this.didUpdateNode()
        return this
    },

    onRemotePeerClose: function(remotePeer) {
        this.removeSubnode(remotePeer)
        this.didUpdateNode()
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



