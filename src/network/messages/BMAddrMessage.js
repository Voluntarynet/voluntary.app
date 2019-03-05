"use strict"

/*

    BMAddrMessage

*/

window.BMAddrMessage = BMMessage.extend().newSlots({
    type: "BMAddrMessage",
}).setSlots({
    init: function () {
        BMMessage.init.apply(this)
        this.setMsgType("addr")
        this.setData([])
    },
    
    addAddrDict: function(dict) {
        this.data().push(dict)
        return this
    },
        
    msgDict: function() {
        return {
            msgType: this.msgType(),
            data: this.data()
        }
    },
})

