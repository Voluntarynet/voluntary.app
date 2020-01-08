
"use strict"

/*

    BMChatThread

*/

window.BMChatThread = class BMChatThread extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("remoteIdentity", null).setShouldStoreSlot(true)
    }

    init () {
        super.init()
        this.setShouldStore(true)
        this.setTitle("thread")  
        this.setShouldStoreSubnodes(true)
        //this.addAction("add")
        this.addAction("deleteAll")
        this.setNodeMinWidth(600)
        this.setNodeHasFooter(true)
        this.setNodeInputFieldMethod("setInputFieldValue")
        this.createSubnodesIndex()

        this.setNodeColumnBackgroundColor("white")
        this.setNodeRowsStartAtBottom(true)
    }

    title () {
        if (this.remoteIdentity()) {
            return this.remoteIdentity().title()
        }
        return "[missing rid]"
    }
	
    nodeThumbnailUrl () {
        if (this.remoteIdentity()) {
            return this.remoteIdentity().nodeThumbnailUrl()
        }
        return null
    }
	
    nodeHeaderTitle () {
        return "Chat with " + this.title()
    }
	
    setInputFieldValue (s) {
        const msg = BMChatMessage.clone()

        msg.setContent(s)
        msg.sendToRemoteId(this.remoteIdentity())
		
        this.addMessage(msg)
		
	    return this
    }
	
    deleteAll () {
	    this.messages().forEach((chatMsg) => {
	        chatMsg.prepareToDelete()
	    })
	    this.removeAllSubnodes()
	    return this
    }
	
    threads () {
        return this.parentNode()
    }

    localIdentity () {
        return this.parentNodeOfType("BMLocalIdentity") // this won't work before it's added as a subnode
    }
	
    assertHasRid () {
	    assert(this.remoteIdentity())
    }
	
    hasValidRemoteIdentity () {
	    const result = this.threads().chatTargetIds().detect((id) => { return id === this.remoteIdentity() })
	    //const result = this.localIdentity().remoteIdentities().idWithPublicKeyString(this.remoteIdentity().publicKeyString()) 
	    //this.debugLog(" " + this.remoteIdentity().title() + ".hasValidRemoteIdentity() = " + result)
	    return result != null
    }
	
    mostRecentDate () {
        return 0
    }
	
    messages () {
        return this.subnodes()
    }
	
    addMessage (msg) {	
        //console.log(this.nodePathString() + " addMessage " + msg.typeId())
	    if(this.addSubnodeIfAbsent(msg)) {
	    	this.postShouldFocusSubnode(msg)
        }
	    return this
    }
    
}.initThisClass()
