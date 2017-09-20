
"use strict"

window.BMTwitterMessage = BMAppMessage.extend().newSlots({
    type: "BMTwitterMessage",
}).setSlots({
    init: function () {
        BMAppMessage.init.apply(this)
        this.setTitle("Twitter")
    },


    place: function() {
        
    },
})

