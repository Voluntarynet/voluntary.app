
"use strict"

/*

    BMFollowingContact

*/

window.BMFollowingContact = BMStorableNode.extend().newSlots({
    type: "BMFollowingContact",
    isFollowing: false,
}).setSlots({
    init: function () {
        BMAppMessage.init.apply(this)
        this.addStoredSlot("isFollowing")
    },

    title: function() {
        return this.remoteIdentity().title()
    },
})

