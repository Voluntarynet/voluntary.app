"use strict"

/*

    BMPongMessage
    
*/

window.BMPongMessage = class BMPongMessage extends BMMessage {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.setMsgType("pong")
    }
        
    msgDict () {
        return {
            msgType: this.msgType()
        }
    }
    
}.initThisClass()
