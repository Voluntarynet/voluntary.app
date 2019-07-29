
"use strict"

/*

    BMFollowers

*/

BMStorableNode.newSubclassNamed("BMFollowers").newSlots({
}).setSlots({
    init: function () {
        BMAppMessage.init.apply(this)
        this.setTitle("followers")
    },

    place: function() {
        
    },
})

