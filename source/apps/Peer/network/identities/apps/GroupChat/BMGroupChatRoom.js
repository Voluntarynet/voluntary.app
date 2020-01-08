
"use strict"

/*

    BMGroupChatRoom

*/

window.BMGroupChatRoom = class BMGroupChatRoom extends BMApplet {
    
    initPrototype () {
        this.newSlot("name", "Untitled")
    }

    init () {
        super.init()

        this.setNotifications(BMNode.clone().setTitle("channels"))
	        this.addSubnode(this.notifications())

        this.setMessages(BMNode.clone().setTitle("direct messages"))
	        this.addSubnode(this.messages())

	    }

    title () {
        return this.name()
    }

    setTitle (aString) {
        this.setName(aString)
        return this
    }

}.initThisClass()

