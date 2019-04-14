"use strict"

/*

    ScreenRightEdgePanGestureRecognizer

    Delegate messages:

        onScreenRightEdgePanBegin
        onScreenRightEdgePanMove
        onScreenRightEdgePanComplete
        onScreenRightEdgePanCancelled

*/

window.ScreenRightEdgePanGestureRecognizer = ScreenEdgePanGestureRecognizer.extend().newSlots({
    type: "ScreenRightEdgePanGestureRecognizer",
}).setSlots({
    init: function () {
        ScreenEdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("right")
        return this
    },

})
