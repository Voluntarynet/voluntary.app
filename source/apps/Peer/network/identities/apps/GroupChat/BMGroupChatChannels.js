"use strict"

/*

    BMGroupChatChannel

*/

window.BMGroupChatChannel = class BMGroupChatChannel extends BMApplet {
    
    initPrototype () {
        this.newSlots({
            name: "Untitled",
        })
    }

    init () {
        super.init()
        return this
    } 

    title () {
        return this.name()
    }
	
    setTitle (aString) {
        this.setName(aString)
        return this
    }

}.initThisClass()

