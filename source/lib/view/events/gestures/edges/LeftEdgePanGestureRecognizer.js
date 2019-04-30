"use strict"

/*

    LeftEdgePanGestureRecognizer

    Delegate messages:

        onLeftEdgePanBegin
        onLeftEdgePanMove
        onLeftEdgePanComplete
        onLeftEdgePanCancelled

*/

window.LeftEdgePanGestureRecognizer = EdgePanGestureRecognizer.extend().newSlots({
    type: "LeftEdgePanGestureRecognizer",
}).setSlots({
    init: function () {
        EdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("left")
        return this
    },

})
