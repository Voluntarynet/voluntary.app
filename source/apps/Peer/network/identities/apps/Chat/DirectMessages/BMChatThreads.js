"use strict"

/*

    BMChatThreads

*/

window.BMChatThreads = class BMChatThreads extends BMContactLinks {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.setLinkProto(BMChatThread)
        //this.setNodeColumnBackgroundColor("white")
    }

    finalize () {
        super.finalize()
        this.setTitle("direct messages")
    }
	
    shelfIconName () {
        return "chat/direct_messages"
	    //return "mail-white"
    }
    
}.initThisClass()