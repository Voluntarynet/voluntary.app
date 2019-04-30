"use strict"

/*

    ScreenLeftEdgePanGestureRecognizer

    Delegate messages:

        onScreenLeftEdgePanBegin
        onScreenLeftEdgePanMove
        onScreenLeftEdgePanComplete
        onScreenLeftEdgePanCancelled

*/

window.ScreenLeftEdgePanGestureRecognizer = ScreenEdgePanGestureRecognizer.extend().newSlots({
    type: "ScreenLeftEdgePanGestureRecognizer",
}).setSlots({
    init: function () {
        ScreenEdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("left")
        return this
    },

})
