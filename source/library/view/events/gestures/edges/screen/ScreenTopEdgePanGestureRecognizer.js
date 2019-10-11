"use strict"

/*

    ScreenTopEdgePanGestureRecognizer

    Delegate messages:

        onScreenTopEdgePanBegin
        onScreenTopEdgePanMove
        onScreenTopEdgePanComplete
        onScreenTopEdgePanCancelled

*/

ScreenEdgePanGestureRecognizer.newSubclassNamed("ScreenTopEdgePanGestureRecognizer").newSlots({
}).setSlots({
    init: function () {
        ScreenEdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("top")
        return this
    },

})
