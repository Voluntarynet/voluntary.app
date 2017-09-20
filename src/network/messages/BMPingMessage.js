"use strict"

window.BMPingMessage = BMMessage.extend().newSlots({
    type: "BMPingMessage",
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
