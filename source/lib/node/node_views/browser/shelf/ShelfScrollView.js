"use strict"

/* 

    ShelfScrollView

*/

window.ShelfScrollView = DomView.extend().newSlots({
    type: "ShelfScrollView",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        return this
    },
	
})

