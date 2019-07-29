"use strict"

/*

    BMPingMessage
    
*/

BMMessage.newSubclassNamed("BMPingMessage").newSlots({
}).setSlots({
    init: function () {
        BMMessage.init.apply(this)
        this.setMsgType("ping")
    },
        
    msgDict: function() {
        return {
            msgType: this.msgType()
        }
    },

})
