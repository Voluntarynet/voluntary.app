
"use strict"

/*

    BMChatMessage

*/

window.BMChatMessage = class BMChatMessage extends BMAppMessage {
    
    initPrototype () {
        this.newSlot("content", null).setShouldStoreSlot(true)
        this.setCanDelete(true)
    }

    init () {
        super.init()
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
	
    description () {
        return this.typeId() + "-" + this.hash() + "'" + this.content() + "'"
    }

    localIdentity () {
        return this.parentNodeOfType("BMLocalIdentity")
    }
    
    localIdentityIsSender () {
        return this.senderId().equals(this.localIdentity())
    }
    
}.initThisClass()

