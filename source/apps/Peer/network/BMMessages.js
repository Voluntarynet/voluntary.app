"use strict"

/*

    BMMessages

    
*/

window.BMMessages = class BMMessages extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("changeNote", null)
        this.newSlot("network", null)
        // TODO: deal with timeouts
        this.newSlot("globalMinDifficulty", 16)
        this.newSlot("placedSet", null).setShouldStoreSlot(true)
        this.newSlot("deletedSet", null).setShouldStoreSlot(true)


        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
    }

    init () {
        super.init()

        this.setTitle("Messages")
        this.setChangeNote(NotificationCenter.shared().newNote().setSender(this).setName("newMessagesMessage"))
        this.setDeletedSet(BMStoredDatedSetNode.clone())
        this.setPlacedSet(BMStoredDatedSetNode.clone())
        
        this.setNoteIsSubnodeCount(true)
        this.setNodeMinWidth(180)
        
        this.createSubnodesIndex()
    }
    
    subnodeProto () {
        return BMObjectMessage
    }

    loadFinalize () {	    
        super.loadFinalize()
        this.removeMessagesNotMatchingIdentities()
        this.handleAllMessages()
        return this
    }
	
    // --- deletedSet -----------------------------------------

    deleteObjMsg (objMsg) {
        const h = objMsg.hash()
        this.deletedSet().addKey(h)
        this.placedSet().removeKey(h)
        //this.getQueueSet().removeKey(h)
        this.removeSubnodeWithHash(h) 
        return this
    }
    
    hasDeletedHash (h) {
        return false ////////////////////////////////////////////////////////////////////////////////// this.deletedSet().hasKey(h)
    }
    
    // --------------------------------------------
    
    messages () {
        return this.subnodes()
    }

    notifyChange () {
        this.changeNote().post()
        return this
    }
    
    validateMsg (objMsg) {
        // TODO: add some validation of fields and size?

        if (objMsg.hasValidationErrors()) {
            console.warn(objMsg.msgHash() + " has validation errors: ", objMsg.validationErrors().join(", "))
            console.log("objMsg.msgDict(): ", objMsg.msgDict())
            return false
        }
		
   		return true
    }

    canRelayObjMsg (objMsg) {
        return this.network().allIdentitiesMap().hasKey(objMsg.senderPublicKeyString())
    }
        
    addMessage (objMsg) { // validate and broadcast
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
    }
    
    hasPlacedObjMsg (objMsg) {
        return this.placedSet().hasKey(objMsg.hash())
    }
	
    markPlacedObjMsg (objMsg) {
        this.placedSet().addKey(objMsg.hash())
        return this
    }
	
    handleObjMsg (objMsg) {
        if (this.hasPlacedObjMsg(objMsg)) {
            return true
        } 
		
        const didPlace = this.network().localIdentities().handleObjMsg(objMsg)

        if (didPlace) {
            this.markPlacedObjMsg(objMsg) 
        } else {
		    console.log("couldn't place objMsg " + objMsg.hash() )
            //console.log("couldn't place objMsg " + objMsg.hash() + " so deleting")
            //this.deleteObjMsg(objMsg)
        }
					
        return didPlace
    }

    handleAllMessages () {
        this.messages().forEach((objMsg) => {
            this.handleObjMsg(objMsg)
        })
    }

    addSubnode (msg) {
        //this.debugLog(" addSubnode " + msg.pid())
        super.addSubnode(msg)
        this.notifyChange()
        return this
    }

    broadcastMessage (msg) {
	    // tell peers
	    const peers = this.network().connectedRemotePeers()
	    console.log("broadcasting to " + peers.length + " peers")
	    peers.forEach(function (peer) {
	        peer.addedObjMsg(msg)
	    })	
    }
    
    removeMessage (msg) {
        this.removeSubnode(msg)
        return this
    }

    
    // handling inv (inventory) messages, immediately respond with BMGetDataMessage for missing hashes

    messageWithHash (h) {
        return this.subnodeWithHash(h)
    }
	
    needsMessageWithHash (h) {
        const wasDeleted = this.deletedSet().hasKey(h)
        const isMissing = this.subnodeWithHash(h) === null
        return (!wasDeleted) && isMissing
    }
	
    inv (invMsg) {
        const remoteInv = invMsg.data()        
        const getMsg = BMGetDataMessage.clone().setRemotePeer(invMsg.remotePeer())
        
        remoteInv.forEach( (h) => {
            if (this.needsMessageWithHash(h)) {
                getMsg.addHash(h)
                //this._queue.atPut(h, true)
            }
        })
        
        if (getMsg.data().length) {
            getMsg.send()
        }
    }
    
    // handling object messages
    
    network () {
        return this.parentNode()
    }
    
    object (msg) {
        const h = msg.msgHash()
        
        // remove from the queue
        //delete this._queue[h]
        
        this.addMessage(msg)
    }
    
    getData (msg) {
        msg.data().forEach((aHash) => {
            const objMsg = this.messageWithHash(aHash)
            if (objMsg) {
                msg.remotePeer().sendMsg(objMsg)
            }
        })
    }
    
    // peer connect
    
    onRemotePeerConnect (remotePeer) {
        // send inv
        //const invMsg = this.currentInvMsg()
        const invMsg = BMInvMessage.clone().addMessages(this.messagesMatchingBloom(remotePeer.peerId().bloomFilter()))

        console.log("onRemotePeerConnect send inv " + invMsg.data().length)

        if (invMsg.data().length) {
            remotePeer.sendMsg(invMsg)
        }
    }

    messagesMatchingBloom (bloom) {
        return this.messages().select( (objMsg) => {
            return bloom.checkEntry(objMsg.senderPublicKeyString())
        })
    }
    
    fullInvMsg () {
        return BMInvMessage.clone().addMessages(this.messages())
    }

    removeMessagesNotMatchingIdentities () {
        // this gets slow for large msg count but target is short term
        // ephemeral messages for now 
		
        const pubkeys = BMNetwork.shared().allIdentityPublicKeyStrings()
        let count = 0
				
        this.messages().shallowCopy().forEach( (objMsg) => {
            //console.log("objMsg: ", objMsg)
            const senderPK = objMsg.senderPublicKeyString()
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
    }
}.initThisClass()
