"use strict"

/*
    Clipboard

    Abstraction around JS clipboard events
*/

window.Clipboard = ideal.Proto.extend().newSlots({
    type: "Clipboard",
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)

        
        return this
    },

})
