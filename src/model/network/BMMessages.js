
BMGetDataItem = BMNode.extend().newSlots({
    type: "BMGetDataItem",
    hash: null,
    fromMsg: null,
}).setSlots({
    
})

BMMessages = BMStorableNode.extend().newSlots({
    type: "BMMessages",
    index: null,
    changeNote: null,
    queue: null,
    network: null,
    // TODO: deal with timeouts
    globalMinDifficulty: 16,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setShouldStore(true)
		this.setShouldStoreItems(true)
		
        this.setTitle("Messages")
        this.setIndex({})
        this.setNodeMinWidth(150)
        this.setChangeNote(NotificationCenter.shared().newNotification().setSender(this).setName("newMessage"))
        this.setQueue({})
        this.setNoteIsItemCount(true)
    },
    
    subnodeProto: function() {
        return BMObjectMessage
    },
    
    messageWithHash: function(hash) {
        return this._index[hash]
    },
    
    messages: function () {
        return this.items()
    },

    notifyChange: function() {
        this.changeNote().post()
        return this
    },
    
    hasMessage: function(msg) {
        return msg.msgHash() in this._index
    },
    
    validateMsg: function(msg) {

        if (msg.actualDifficulty() < this.globalMinDifficulty()) {
            console.log("rejecting message '" + msg.msgHash() +"' with pow of " + msg.actualDifficulty() + " < globalMinDifficulty of " + this.globalMinDifficulty())
            // check should be at remotePeer level
            this.removeMessage(msg)
            return false
        }
        
        if (msg.msgHash() == null) {
            console.log("attempt to add message with no msgHash")
            return false
        }
        
        if (this.hasMessage(msg)) {
            console.log("attempt to add duplicate message")
            return false
        }

   		return true
    },
        
    addMessage: function(msg) { // validate and broadcast
	
		console.log(this.type() + " addMessage ", msg)
		
        if (!this.validateMsg(msg)) {
            return false
        }
        
        this.addItem(msg)
        this.broadcastMessage(msg)
        
        return true
    },

	setItems: function(items) {
		BMStorableNode.setItems.apply(this, [items])
		
		var self = this
		items.forEach(function (item) {
			self.didAddMsg(item)
		})
	},

	addItem: function(msg) {
		console.log(this.type() + " addItem " + msg.pid())
		BMStorableNode.addItem.apply(this, [msg])
		this.didAddMsg(msg)
		return this
	},
	
	didAddMsg: function(msg) {
        msg.place()

        this._index[msg.msgHash()] = msg
        this.notifyChange()
        this.didUpdate()
	},

	broadcastMessage: function(msg) {
	    // tell peers
	    var peers = this.network().connectedRemotePeers()
	    console.log("broadcasting to " + peers.length + " peers")
	    peers.forEach(function (peer) {
	        peer.addedObjectMsg(msg)
	    })	
	},
    
    removeMessage: function(msg) {
		this.removeItem(msg) // garbage collector will remove persisted version
        delete this._index[msg.msgHash()]
        return this
    },
    
    updateIndex: function () {
        var index = {}
        
        this.messages().forEach(function (msg) {
            index[msg.msgHash()] = msg
        })
        
        this.setIndex(index)  
        this.notifyChange()
        return this
    },
    
    asyncLoad: function(callback) {
        var self = this
/*
        this.subnodeProto().protoSoup().asyncValues(function (values) {
            values.forEach(function(json) {
                //console.log("load json ", json)
                var msg = BMObjectMessage.clone().setMsgDict(json)
                //console.log("loaded msg ", msg)
                self.addMessage(msg)
            })
            
            self.updateIndex()
            
            if (callback) { 
                callback()
            }
        })
*/
        return this
    },
    
    // handling inv messages
    
    needsHash: function(h) {
        var hasKey = h in this._index
        var hasQueued = h in this._queue
        return !hasKey && !hasQueued
    },
    
    inv: function(invMsg) {
        var remoteInv = invMsg.data()
        var self = this
        
        var getMsg = BMGetDataMessage.clone().setRemotePeer(invMsg.remotePeer())
        
        remoteInv.forEach(function (h) {
            if (self.needsHash(h)) {
                getMsg.addHash(h)
                self._queue[h] = true
            }
        })
        
        if (getMsg.data().length) {
            getMsg.send()
        }
    },
    
    hasQueued: function () {
        var q = this._queue
        for (var k in q) {
            if (q.hasOwnProperty(k)) {
                return true
            }
        }
        return false
    },
    
    processQueue: function() {
        var q = this.queue()
        this.setQueue({})
        
        for (var h in q) {
            if (q.hasOwnProperty(h)) {
                var item = q[h]
                item.sendRequest()
                BMGetDataMessage.clone().setData(h)
            }
        }        
    },
    
    // handling object messages
    
    network: function() {
        return this.parentNode()
    },
    
    object: function(msg) {
        var h = msg.msgHash()
        
        // remove from the queue
        delete this._queue[h]
        
        this.addMessage(msg)
    },
    
    objectWithHash: function(aHash) {
        // move to index after this works
        return this.messages().detect(function (msg) { 
            return msg.msgHash() == aHash
        })
    },
    
    getData: function(msg) {
        var self = this
        msg.data().forEach(function(aHash) {
            var objMsg = self.objectWithHash(aHash)
            if (objMsg) {
                msg.remotePeer().sendMsg(objMsg)
            }
        })
    },
    
    // peer connect
    
    onRemotePeerConnect: function(remotePeer) {
        // send inv
        var invMsg = this.currentInvMsg()

        console.log("onRemotePeerConnect send inv " + invMsg.data().length)

        if (invMsg.data().length) {
            remotePeer.sendMsg(invMsg)
        }
    },
    
    currentInvMsg: function () {
        var invMsg = BMInvMessage.clone()
        this.messages().forEach(function (objMsg) {
            invMsg.addMsgHash(objMsg.msgHash())
        })
        return invMsg
    },

	didLoadFromStore: function() {
		//console.log(this.type() + " didLoadFromStore")
		this.updateIndex()
	},

})
