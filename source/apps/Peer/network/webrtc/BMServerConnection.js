"use strict"

/*

    BMServerConnection

*/

window.BMServerConnection = class BMServerConnection extends BMNode {
    
    initPrototype () {
        this.newSlot("server", null)
        this.newSlot("serverConn", null)
        this.newSlot("webSocketListener", null)
        this.newSlot("peerId", null)
        this.newSlot("remotePeers", null)
        this.newSlot("delegate", null)
        this.newSlot("lastError", null)
        this.newSlot("privateKey", null)
        this.newSlot("status", "not connected")
        this.newSlot("sessionId", null)
        this.newSlot("statusLog", null)
        this.newSlot("pendingMessages", null)
        this.newSlot("isOpen", false)
        this.newSlot("pingInterval", null)
        this.newSlot("error", null) //.setShouldStore(true)
    }

    init () {
        super.init()
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
        //this.setLog(BMNode.clone())

        this.setSessionId(BMKeyPair.clone().generatePrivateKey())
        this.setPeerId(BMPeerId.clone())
        this.createSubnodesIndex()

        this.setPendingMessages({});
    }
    
    addLog (s, error) {
        const statusNode = BMFieldSetNode.clone().setTitle(s).setSubtitle(new Date().toString())
        //this.statusLog().addSubnode(statusNode)
        statusNode.error = function () { return this._error }
        statusNode._error = ""
        
        if (error) {	        
	        statusNode._error = error.description()
	        statusNode.setNote("&gt;")
	        //statusNode.makeNoteRightArrow()
	    }
	    
        //const entry = BMDataStoreRecord.clone().setNodeColumnBackgroundColor("white").setNodeMinWidth(300)
        statusNode.addField(BMTextAreaField.clone().setKey("dict").setValueMethod("error").setValueIsEditable(false).setIsMono(true))
        //entry.setTitle(s)
        //entry.setSubtitle(new Date().toString())
        //entry.setValue(s)
        this.statusLog().addSubnode(statusNode)
    }

    setStatus (s, error) {
        //console.warn(this.typeId() + ".setStatus(" + s + ")")
        if (this._status !== s) {
            this._status = s
            this.setSubtitle(s)
            
            this.addLog(s, error)
            
            //this.scheduleSyncToView()
            this.didUpdateNode() 
            this.server().didUpdateNode() 
        }
        return this
    }

    shortId () {
        if (this.peerId()) {
            return this.peerId().toString().substring(0, 3)
        }
        return "-"
    }
    
    subtitle () {
        return this.status()
    }
    
    /*
    subnodes () {
        return this.remotePeers()
    }
    */

    // --- server connection --------------------------
	
    serverConnectionOptions () {
        //console.log("BMNetwork.shared().stunServers().peerOptionsDict() = ", BMNetwork.shared().stunServers().peerOptionsDict())
        return { 
            host: this.server().host(), 
            port: this.server().port(),
            path: this.server().path(),
            secure: this.server().isSecure(),
            //config: BMNetwork.shared().stunServers().peerOptionsDict(),
            //config: this.defaultConfig()
            //isDebugging: 3, 
        }
    }

    // --- connection id ----
	
    currentPeerId () {
        const peerId = BMPeerId.clone()
        peerId.setPublicKeyString(this.sessionId().publicKeyString())
        peerId.setBloomFilter(BMNetwork.shared().idsBloomFilter())
        //this.log("currentPeerId = '" + peerId.toString() + "'")
        return peerId
    }

    serverConnUrl () {
        return "ws" + (this.server().isSecure() ? "s" : "") + "://" + this.server().host() + ":" + this.server().port();
    }
            
    startListening () {
        assert(this.serverConn() !== null)
        this.setWebSocketListener(WebSocketListener.clone().setListenTarget(this.serverConn()).setDelegate(this))
        this.webSocketListener().start()
        return this
    }

    stopListening () {
        if (this.webSocketListener()) {
            this.webSocketListener().stop()
        }
        return this
    }


    connect () {
        // TODO: add timeout and tell server when it occurs

        if (!this.serverConn()) {
            this.setStatus("connecting...")
            this.setTitle("Connection")
			
            this.setPeerId(this.currentPeerId())
			
            try {
                this.setServerConn(new WebSocket(this.serverConnUrl()));
            } catch(error) {
                this.handleError(error)
                return this
            }
            
            this.log("Server " +  this.shortId() + ".connect()")

            this.startListening()
        }

        return this;
    }

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
            this.handleError(new Error("Received invalid response: " + JSON.stringify(msg)));
        }
    }

    receiveSignalFromPeer(data) {
        let remotePeer = this.remotePeers().subnodes().detect(p => p.peerId().toString() === data.fromPeer);
        if (remotePeer === null) {
            remotePeer = this.remotePeers().addRemotePeerForId(data.fromPeer);
            remotePeer.setConn(new SimplePeer({
                initiator: false,
                config: BMStunServers.defaultOptions()
            }));
        }
        remotePeer.conn().signal(data.signal);
    }

    reconnect () {
        //this.debugLog(".reconnect()")
        this.close()
        return this;
    }
	
    close () {
        this.setStatus("closing...")
        this.remotePeers().closeAll()
        this.stopPingInterval()
        //this.remotePeers().forEach((peer) => { peer.close() })
        //this.removeAllSubnodes()
		
        if (this.serverConn()) {
            this.stopListening() // do we want to do this before calling close?
            this.serverConn().close()
            this.setServerConn(null)
        }

        this.setStatus("offline")

        this.onClose();
        return this
    }

    finish () { // for internal use
        if (this.serverConn()) {
            this.stopListening() // do we want to do this before calling close?
            //this.serverConn().close()
            this.setServerConn(null)
        }
    }

    showPeers () {
	    this.remotePeers().showPeers()
	    /*
		this.debugLog(".showPeers()")
		this.subnodes().forEach((peer) => {
			console.log("    ", peer.hash())
		})
		*/
    }
  
    /*  
    log (s) {
        if (this.isDebugging()) {
            this.debugLog(" " + s)
        }
        return this
    }
*/


    // --- handling errors ---
    
    handleError (error) {
        if (error === undefined) {
            // closed connection?
            return
        }

        console.error(this.typeId() + " ERROR: ", error);
        this.setError(error)

        // special case
        if (error && !error.message.beginsWith("Could not connect to peer")) {
	        this.setStatus(error.message, error)	        
            this.log(this.type() + " onError: " + error);
            this.finish()
        }
    }

    // --- handling web socket events ---

    onError (event) {
        this.handleError(new Error(event.data))
    }
    
    onOpen () {
        this.setIsOpen(true)
        this.setTitle("Connection " + this.shortId())
        this.setStatus("connected")
        this.log("onOpen " + this.peerId().toString());
        this.startPingInterval()
        this.requestId();
    }

    startPingInterval () {
        assert(this.pingInterval() === null)
        const p = setInterval(() => { this.send("ping"); }, 15000)
        this.setPingInterval(p)
        return this
    }

    stopPingInterval () {
        if (this.pingInterval()) {
            clearInterval(this.pingInterval());
            this.setPingInterval(null)
        }
        return this
    }

    onClose (err) {
        this.setIsOpen(false)
        this.stopPingInterval()
        this.log(this.type() + ".onClose " + err)
        this.setStatus("closed")
        if (err) {
            this.setLastError("close error: " + err)
        }

        this.finish()
    }

    onMessage (event) {
        try {
            //console.log("BMServerConnection receive: " + event.data);
            const msg = JSON.parse(event.data);
            this.perform("receive" + msg.name.capitalized(), msg.data);
        } catch (error) {
            this.handleError(error);
        }
    }

    // ----------------------------------
    
    requestId () {
        if (this.isOpen()) {
            this.setPeerId(this.currentPeerId());
            return this.send("requestId", { requestedId: this.peerId().toString() }).then(() => {
                this.updatePeers();
            }).catch(error => this.handleError(error));
        }
    }

    /*
	scheduleUpdatePeers () {
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

    isConnected () {
        return this.isOpen()
        //return this.serverConn() !== null
    }

    //returns a Promise
    send (name, data) {
        const msg = BMServerMessage.clone();
        msg.setServerConnection(this);
        msg.setName(name);
        msg.setData(data);
        return msg.send();
    }

    /*
    onData (data) {
        //this.log("onData " + data)
    }
*/

    // remote peers
    
    updatePeers () {
        //this.log("updatePeers");
        this.send("listAllPeers")
            .then((peerIds) => this.setPeerIds(peerIds))
            .catch(error => this.handleError(error));
    }

    setPeerIds (ids) {
        //this.debugLog(".setPeerIds(\n" + ids.join("\n") + "\n)")		
        ids.remove(this.peerId().toString())
        this.remotePeers().setPeerIds(ids)
        //this.connectToMatchingPeerIds()
    }

    /*    
    connectToAllPeerIds () {
        this.peerIds().forEach((peerId) => { this.connectToPeerId(peerId) })
        return this
    }
*/

    onRemotePeerClose (remotePeer) {
        //this.removeSubnode(remotePeer)
        return this
    }
    
    broadcastMsg (msg) {
        //this.log("broadcastMsg " + msg)
        this.remotePeers().subnodes().forEach((remotePeer) => { 
            //console.log("remotePeer = ", remotePeer)
            remotePeer.sendMsg(msg)
        })
        return this
    }
    
    receivedMsgFrom (msg, remotePeer) {
        const d = this.delegate()
        if (d && d.receivedMsgFrom) {
            d.receivedMsgFrom.apply(d, [msg, remotePeer])
        }
    }
    
    connectedRemotePeers () {
        return this.remotePeers().connectedRemotePeers()
    }

    connectedRemotePeerCount () {
        return this.remotePeers().connectedRemotePeers().length
    }

    remotePeersCount () {
        return this.remotePeers().count()
    }
    
}.initThisClass()



