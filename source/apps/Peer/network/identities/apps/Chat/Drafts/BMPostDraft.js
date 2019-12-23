"use strict"

/*

    BMPostDraft

*/

window.BMPostDraft = class BMPostDraft extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("content", null).setShouldStoreSlot(true)
        this.setCanDelete(true)
        //this.setContent("...".loremIpsum(40, 100))	
        this.setShouldStore(true)	
    }

    init () {
        super.init()
        this.customizeNodeRowStyles().setToBlackOnWhite()
    }
	
    nodeRowLink () {
        return null
    }
	
    title () {
	    return this.content()
    }
	
    wasSentByMe () {
        return this.senderId() === this.localIdentity()
    }
	
    contentDict () {
        const contentDict = {}
        contentDict.content = this.content()
        return contentDict
    }
	
    setContentDict (contentDict) {
        this.setContent(contentDict.content)
        //this.scheduleSyncToView()
        return this
    }

    localIdentity () {
        return this.parentNodeOfType("BMLocalIdentity")
    }
    
    avatarImageDataURL () {
        return this.localIdentity().profile().profileImageDataUrl()
    }
	
    post () {
        const msg = BMPostMessage.clone()
        msg.setContent(this.content())
        msg.postFromSender(this.localIdentity())
        this.delete()
        //this.addMessage(msg)
    }
    
}.initThisClass()

