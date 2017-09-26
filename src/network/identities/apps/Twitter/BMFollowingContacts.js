
"use strict"

window.BMFollowingContacts = BMStorableNode.extend().newSlots({
    type: "BMFollowingContacts",
}).setSlots({
    init: function () {
        BMAppMessage.init.apply(this)
        this.setTitle("following")
    },


    place: function() {
        
    },
})

