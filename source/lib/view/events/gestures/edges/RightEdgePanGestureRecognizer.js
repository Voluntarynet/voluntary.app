"use strict"

/*

    RightEdgePanGestureRecognizer

    Delegate messages:

        onRightEdgePanBegin
        onRightEdgePanMove
        onRightEdgePanComplete
        onRightEdgePanCancelled

*/

window.RightEdgePanGestureRecognizer = EdgePanGestureRecognizer.extend().newSlots({
    type: "RightEdgePanGestureRecognizer",
}).setSlots({
    init: function () {
        EdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("right")
        return this
    },

})
