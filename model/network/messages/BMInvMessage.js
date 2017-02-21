

BMInvMessage = BMMessage.extend().newSlots({
    type: "BMInvMessage",
}).setSlots({
    init: function () {
        BMMessage.init.apply(this)
        this.setMsgType("inv")
        this.setData([])
    },
    
    addMsgHash: function(msgHash) {
        this.data().push(msgHash)
        return this
    },
    
    msgDict: function() {
        return {
            msgType: this.msgType(),
            data: this.data()
        }
    },

})
