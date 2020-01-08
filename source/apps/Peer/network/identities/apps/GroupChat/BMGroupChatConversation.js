"use strict"

/*

    BMGroupConversation

*/

window.BMGroupConversation = class BMGroupConversation extends BMApplet {
    
    initPrototype () {
        this.newSlot("remoteIdentity", null)
    }

    init () {
        super.init()
        return this
    } 

    title () {
        this.remoteIdentity().title()
    }

    messages () {
        return this.subnodes()
    }

}.initThisClass()

