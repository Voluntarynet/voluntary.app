"use strict"

/*

    BMInvMessage

*/

BMMessage.newSubclassNamed("BMInvMessage").newSlots({
    //bloomFilter: null, // used to filter senders
}).setSlots({
    init: function () {
        BMMessage.init.apply(this)
        this.setMsgType("inv")
        this.setData([])
    },
    
    addMsgHash: function(msgHash) {
        //const f = this.bloomFilter()
        //if (f == null || f.checkEntry(
        this.data().push(msgHash)
        return this
    },

    addMessages: function(msgs) {
	    msgs.forEach( (objMsg) => {
            this.addMsgHash(objMsg.msgHash())
        })
        return this
    },
    
    msgDict: function() {
        return {
            msgType: this.msgType(),
            data: this.data()
        }
    },

})
