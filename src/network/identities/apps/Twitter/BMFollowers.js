
"use strict"

window.BMFollowers = BMStorableNode.extend().newSlots({
    type: "BMFollowers",
}).setSlots({
    init: function () {
        BMAppMessage.init.apply(this)
        this.setTitle("followers")
    },

    place: function() {
        
    },
})

