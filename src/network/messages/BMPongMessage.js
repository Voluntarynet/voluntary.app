

BMPongMessage = BMMessage.extend().newSlots({
    type: "BMPongMessage",
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
})
