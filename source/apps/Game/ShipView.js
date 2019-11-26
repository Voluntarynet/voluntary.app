"use strict"

/*

    ShipView

*/


ThingView.newSubclassNamed("ShipView").newSlots({
}).setSlots({
    init: function () {
        ThingView.init.apply(this)

        return this
    },

    update: function() {
        ThingView.update.apply(this)
    },


}).initThisProto()