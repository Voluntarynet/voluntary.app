"use strict"

/*
    MousePosition

    Mouse position at a point in time.

*/

window.MousePosition = ideal.Proto.extend().newSlots({
    type: "MousePosition",
    x: 0,
    y: 0,
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
        return this
    },

    newForEvent: function(event) {
        let mp = MousePosition.clone()
        mp.setX(event.clientX)
        mp.setY(event.clientY)
        return mp
    },

    /*
    positionInView: function(aView) {
        let bounds = aView.boundingClientRect()
        return {
            _x: this.x() - bounds.left,
            _y: this.y() - bounds.top
        }
    },
    */
	
})
