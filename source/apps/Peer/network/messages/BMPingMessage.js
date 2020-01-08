"use strict"

/*

    BMPingMessage
    
*/

window.BMPingMessage = class BMPingMessage extends BMMessage {
    
    initPrototype () {

    }

    init () {
        super.init()
        this.setMsgType("ping")
    }
        
    msgDict () {
        return {
            msgType: this.msgType()
        }
    }

}.initThisClass()
