
"use strict"

/*

    BMFollowingContact

*/

BMStorableNode.newSubclassNamed("BMFollowingContact").newSlots({
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

