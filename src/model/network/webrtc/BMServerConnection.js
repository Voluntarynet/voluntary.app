//var bitcore = require("bitcore-lib")
//var Peer = require('peerjs')

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
    log: null,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this._remotePeers = []
        this.setTitle("Connection")
        this.setNoteIsItemCount(true)
        //this.setViewClassName("GenericView")
        this.setNodeMinWidth(160)
        //this.setLog(BMNode.clone())
    },
    
    setStatus: function(s) {
        this._status = s
        this.setSubtitle(s)
        return this
    },

    privateKey: function () {
        if (!this._privateKey) {
            this._privateKey = new bitcore.PrivateKey();
        }
        return this._privateKey
    },
    
    publicKeyString: function() {
        return this.privateKey().publicKey.toString()
    },
    
    address: function() {
        return this.privateKey().toAddress()
    },

    shortId: function() {
        var id = this.id()
        if (id.length > 3) {
            return id.substring(id.length - 3)
        }
        
        return id
    },
    
    subtitle: function () {
        return this.status()
    },   
    
    items: function () {
        return this.remotePeers()
    },
    
    makePeerIdString: function() {
        // return this.publicKeyString()
        return this.shortId()
    },

    localOptions: function () {
        return { 
                //debug: true, 
                host: this.server().host(), 
                port: this.server().port() 
            }
    },
    
    iceOptions: function() {
        return {
                debug: true, 
                iceServers: this.iceServers()
            }
    },
    
    connect: function () {
        // TODO: add timeout and tell server when it occurs

        if (!this._serverConn) {
            var self = this
            //this.log("connecting...");
            this.setStatus("connecting...")
            
            this.setTitle("Connection")
            
            this._serverConn = new Peer(this.localOptions())                
            //this._serverConn = new Peer(this.makePeerIdString(), options)
                      
            this._serverConn.on('open', function(id) { 
                self.setId(id); 
                self.onOpen() 
            })
            
            this._serverConn.on('connection', function (aConn) { 
                //console.log("connection"); 
                self.addRemotePeerConn(aConn) 
            })
            
            this._serverConn.on('error', function (error) { 
                self.onError(error)
            })  
            
            this._serverConn.on('close', function (error) { 
                console.log("BMServerConnection close with error: ", error); 
                self.onClose(error)
            }) 
        }
        return this              
    },

    onError: function(error) {
        this.setStatus(error)
        this.log(this.type() + " onError: ", error);
        this._serverConn = null
        this.didUpdate()
    },
    
    onOpen: function() {
        this.setTitle("Connection " + this.shortId())
        this.setStatus("connected")
        //this.log("onOpen " + this.id());
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
        var self = this
        this.serverConn().listAllPeers(function(pids) {
            self.setPeerIds(pids)
        })
    },

    setPeerIds: function (pids) {
        pids.remove(this.id())
        //this.log(" setPeerIds " + JSON.stringify(pids));
        this._peerIds = pids
        this.connectToAllPeerIds()
        return this
    },

    connectToAllPeerIds: function () {
        var self = this
        this.peerIds().forEach(function (peerId) {  self.connectToPeerId(peerId) })
        return this
    },

    isConnectedToPeerId: function(peerId) {
        return this.remotePeers().detect(function(peer) {
            peer.id() == peerId
        }) != null
    },

    connectToPeerId: function(pid) {
        //console.log("limiting peer connections to one's with short pids")
        if (!this.isConnectedToPeerId(pid) && pid.length < 25) {
            //this.log("connectToPeerId " + pid)
            //try {
                                
                var conn = this.serverConn().connect(pid);
                this.addRemotePeerConn(conn)
                /*
            } catch (error) {
                console.log("ERROR on BMServerConnection.connectToPeerId('" + pid + "')")
                console.error("    " + error.message )
                //console.log( error.stack )
                //throw error
            }
            */
        }
    },

    addRemotePeerConn: function(aConn) {
        this.log("addRemotePeerConn " + aConn.peer)
        var rp = BMRemotePeer.clone().setConn(aConn).setServerConnection(this)
        this.addItem(rp)
        console.log("BMServerConnection addRemotePeerConn didUpdate --------------------")
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

    iceServers: function() {
        return [
            {url:'stun:stun01.sipphone.com'},
            {url:'stun:stun.ekiga.net'},
            {url:'stun:stun.fwdnet.net'},
            {url:'stun:stun.ideasip.com'},
            {url:'stun:stun.iptel.org'},
            {url:'stun:stun.rixtelecom.se'},
            {url:'stun:stun.schlund.de'},
            {url:'stun:stun.l.google.com:19302'},
            {url:'stun:stun1.l.google.com:19302'},
            {url:'stun:stun2.l.google.com:19302'},
            {url:'stun:stun3.l.google.com:19302'},
            {url:'stun:stun4.l.google.com:19302'},
            {url:'stun:stunserver.org'},
            {url:'stun:stun.softjoys.com'},
            {url:'stun:stun.voiparound.com'},
            {url:'stun:stun.voipbuster.com'},
            {url:'stun:stun.voipstunt.com'},
            {url:'stun:stun.voxgratia.org'},
            {url:'stun:stun.xten.com'},
        ]
    },   
})



