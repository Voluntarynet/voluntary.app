
/*
BMGetDataItem = BMNode.extend().newSlots({
    type: "BMGetDataItem",
    hash: null,
    fromMsg: null,
}).setSlots({
})
*/

"use strict"

window.BMMessages = BMStorableNode.extend().newSlots({
    type: "BMMessages",
    changeNote: null,
    network: null,
    // TODO: deal with timeouts
    globalMinDifficulty: 16,
    debug: false,
    placedSet: null,
    deletedSet: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
		
        this.setTitle("Messages")
        this.setChangeNote(NotificationCenter.shared().newNote().setSender(this).setName("newMessagesMessage"))

        this.setDeletedSet(BMDatedSet.clone())
        this.addStoredSlot("deletedSet")

        this.setPlacedSet(BMDatedSet.clone())
        this.addStoredSlot("placedSet")
        
        this.setNoteIsSubnodeCount(true)
        this.setNodeMinWidth(180)
		
        this.createSubnodeIndex()
    },
    
    subnodeProto: function() {
        return BMObjectMessage
    },

    loadFinalize: function() {	    
        this.removeMessagesNotMatchingIdentities()
        this.handleAllMessages()
        return this
    },
	
    // --- deletedSet -----------------------------------------

    deleteObjMsg: function(objMsg) {
        var h = objMsg.hash()
        this.deletedSet().addKey(h)
        this.placedSet().removeKey(h)
        //this.getQueueSet().removeKey(h)
        this.removeSubnodeWithHash(h) 
        return this
    },
    
    hasDeletedHash: function(h) {
        return false ////////////////////////////////////////////////////////////////////////////////// this.deletedSet().hasKey(h)
    },
    
    // --------------------------------------------
    
    messages: function () {
        return this.subnodes()
    },

    notifyChange: function() {
        this.changeNote().post()
        return this
    },
    
    validateMsg: function(objMsg) {
        // TODO: add some validation of fields and size?

        if (objMsg.hasValidationErrors()) {
            console.warn(objMsg.msgHash() + " has validation errors: ", objMsg.validationErrors().join(", "))
            console.log("objMsg.msgDict(): ", objMsg.msgDict())
            return false
        }
		
   		return true
    },

    canRelayObjMsg: function(objMsg) {
        return this.network().allIdentitiesMap().hasKey(objMsg.senderPublicKeyString())
    },
        
    addMessage: function(objMsg) { // validate and broadcast
        if (!this.validateMsg(objMsg)) {
            return false
        }
		
        if (!this.canRelayObjMsg(objMsg)) {
			
            return false
        }

        if (this.hasSubnodeWithHash(objMsg.msgHash())) {
            console.warn("attempt to add duplicate message ", objMsg.msgHash())
            console.log("I have msgs:\n  " + this.messages().map((msg) => { return msg.msgHash() }).join("\n  "))
            return false
        } else {
        	this.addSubnode(objMsg)
        }
        
        this.handleObjMsg(objMsg)
	    this.broadcastMessage(objMsg)		
        return true
    },
    
    hasPlacedObjMsg: function(objMsg) {
        return this.placedSet().hasKey(objMsg.hash())
    },
	
    markPlacedObjMsg: function(objMsg) {
        this.placedSet().addKey(objMsg.hash())
        return this
    },
	
    handleObjMsg: function(objMsg) {
        if (this.hasPlacedObjMsg(objMsg)) {
            return true
        } 
		
        var didPlace = this.network().localIdentities().handleObjMsg(objMsg)

        if (didPlace) {
            this.markPlacedObjMsg(objMsg) 
        } else {
		    console.log("couldn't place objMsg " + objMsg.hash() )
            //console.log("couldn't place objMsg " + objMsg.hash() + " so deleting")
            //this.deleteObjMsg(objMsg)
        }
					
        return didPlace
    },

    handleAllMessages: function() {
        this.messages().forEach((objMsg) => {
            this.handleObjMsg(objMsg)
        })
    },

    addSubnode: function(msg) {
        //console.log(this.type() + " addSubnode " + msg.pid())
        BMStorableNode.addSubnode.apply(this, [msg])
        this.notifyChange()
        return this
    },

    broadcastMessage: function(msg) {
	    // tell peers
	    var peers = this.network().connectedRemotePeers()
	    console.log("broadcasting to " + peers.length + " peers")
	    peers.forEach(function (peer) {
	        peer.addedObjMsg(msg)
	    })	
    },
    
    removeMessage: function(msg) {
        this.removeSubnode(msg)
        return this
    },

    
    // handling inv (inventory) messages, immediately respond with BMGetDataMessage for missing hashes

    messageWithHash: function(h) {
        return this.subnodeWithHash(h)
    },
	
    needsMessageWithHash: function(h) {
        var wasDeleted = this.deletedSet().hasKey(h)
        var isMissing = this.subnodeWithHash(h) == null
        return (!wasDeleted) && isMissing
    },
	
    inv: function(invMsg) {
        var remoteInv = invMsg.data()        
        var getMsg = BMGetDataMessage.clone().setRemotePeer(invMsg.remotePeer())
        
        remoteInv.forEach( (h) => {
            if (this.needsMessageWithHash(h)) {
                getMsg.addHash(h)
                //this._queue[h] = true
            }
        })
        
        if (getMsg.data().length) {
            getMsg.send()
        }
    },
    
    // handling object messages
    
    network: function() {
        return this.parentNode()
    },
    
    object: function(msg) {
        var h = msg.msgHash()
        
        // remove from the queue
        //delete this._queue[h]
        
        this.addMessage(msg)
    },
    
    getData: function(msg) {
        msg.data().forEach((aHash) => {
            var objMsg = this.messageWithHash(aHash)
            if (objMsg) {
                msg.remotePeer().sendMsg(objMsg)
            }
        })
    },
    
    // peer connect
    
    onRemotePeerConnect: function(remotePeer) {
        // send inv
        //var invMsg = this.currentInvMsg()
        var invMsg = BMInvMessage.clone().addMessages(this.messagesMatchingBloom(remotePeer.peerId().bloomFilter()))

        console.log("onRemotePeerConnect send inv " + invMsg.data().length)

        if (invMsg.data().length) {
            remotePeer.sendMsg(invMsg)
        }
    },

    messagesMatchingBloom: function (bloom) {
        return this.messages().select( (objMsg) => {
            return  bloom.checkEntry(objMsg.senderPublicKeyString())
        })
    },
    
    fullInvMsg: function () {
        return BMInvMessage.clone().addMessages(this.messages())
    },

    removeMessagesNotMatchingIdentities: function() {
        // this gets slow for large msg count but target is short term
        // ephemeral messages for now 
		
        var pubkeys = BMNetwork.shared().allIdentityPublicKeyStrings()
        var count = 0
				
        this.messages().copy().forEach( (objMsg) => {
            //console.log("objMsg: ", objMsg)
            var senderPK = objMsg.senderPublicKeyString()
            if (!pubkeys.contains(senderPK)) {
                this.removeMessage(objMsg)
                count ++
                console.log("no match for sender " + senderPK)
            } else {
                //console.log("matched sender " + senderPK)
            }
        })

        if (count) {
            this.log("removeMessagesNotMatchingIdentities removed " + count + " messages")
        }
	
        return this
    },
})
