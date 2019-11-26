"use strict"

/*

    BMPongMessage
    
*/

BMMessage.newSubclassNamed("BMPongMessage").newSlots({
}).setSlots({
    init: function () {
        BMMessage.init.apply(this)
        this.setMsgType("pong")
    },
        
    msgDict: function() {
        return {
            msgType: this.msgType()
        }
    },
    
}).initThisProto()
