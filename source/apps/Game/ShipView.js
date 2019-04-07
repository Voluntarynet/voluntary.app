"use strict"

/*

    ShipView

*/


window.ShipView = ThingView.extend().newSlots({
    type: "ShipView",
}).setSlots({
    init: function () {
        ThingView.init.apply(this)

        return this
    },

    update: function() {
        ThingView.update.apply(this)
    },


})