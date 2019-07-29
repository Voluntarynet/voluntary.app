
"use strict"

/*

    BMFollowingContacts

*/

BMStorableNode.newSubclassNamed("BMFollowingContacts").newSlots({
}).setSlots({
    init: function () {
        BMAppMessage.init.apply(this)
        this.setTitle("following")
    },


    place: function() {
        
    },
})

