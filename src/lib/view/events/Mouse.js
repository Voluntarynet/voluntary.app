"use strict"

/*
    Mouse

    Global shared instance that tracks current mouse state in window coordinates.
    View has convenience methods to get this state into view coords.

*/


window.Mouse = ideal.Proto.extend().newSlots({
    type: "Mouse",
    isDown: false,
    downPos: null,
    currentPos: null,
    upPos: null,
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
        return this
    },

    shared: function() {   
        return this.sharedInstanceForClass(Mouse)
    },

    // --- events ---

    onMouseDown: function(event) {
        console.log("Mouse onMouseDown")
        let mp = MousePosition.newForEvent(event)
        this.setIsDown(true);
        this.setDownPos(mp)
        return true
    },

    onMouseMove: function (event) {
        let mp = MousePosition.newForEvent(event)
        this.setCurrentPos(mp)
        return true
    },

    onMouseUp: function(event) {
        let mp = MousePosition.newForEvent(event)
        this.setIsDown(false);
        this.setUpPos(mp)
        return true
    },  

    // -- helpers ---

    dragVector: function(event) {
        let v = { _x: 0, _y: 0 }
        let dp = this.downPos()

        if (dp) {
            let cp = this.currentPos()
            if (!this.isDown()) {
                cp = this.upPos()
            }
            v._x = (cp._x - dp._x);
            v._y = (cp._y - dp._y);
        }

        return v
    },
})

console.log("window.Mouse loaded")
