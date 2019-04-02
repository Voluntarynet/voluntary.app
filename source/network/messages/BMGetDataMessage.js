"use strict"

/*

    BMGetDataMessage

*/

window.BMGetDataMessage = BMMessage.extend().newSlots({
    type: "BMGetDataMessage",
}).setSlots({
    init: function () {
        BMMessage.init.apply(this)
        this.setMsgType("getData")
        
        this.setData([])
    },
    
    addHash: function(aHash) {
        this.data().push(aHash)
        return this
    },
        
    msgDict: function() {
        return {
            msgType: this.msgType(),
            data: this.data()
        }
    },
    
    send: function() {
        this.remotePeer().sendMsg(this)
        return this
    },

})
