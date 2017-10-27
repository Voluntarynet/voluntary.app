"use strict"

window.ShelfScrollView = DivView.extend().newSlots({
    type: "ShelfScrollView",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        return this
    },
	
})

