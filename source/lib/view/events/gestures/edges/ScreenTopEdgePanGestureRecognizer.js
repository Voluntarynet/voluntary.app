"use strict"

/*

    ScreenTopEdgePanGestureRecognizer

    Delegate messages:

        onScreenTopEdgePanBegin
        onScreenTopEdgePanMove
        onScreenTopEdgePanComplete
        onScreenTopEdgePanCancelled

*/

window.ScreenTopEdgePanGestureRecognizer = ScreenEdgePanGestureRecognizer.extend().newSlots({
    type: "ScreenTopEdgePanGestureRecognizer",
}).setSlots({
    init: function () {
        ScreenEdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("top")
        return this
    },

})
