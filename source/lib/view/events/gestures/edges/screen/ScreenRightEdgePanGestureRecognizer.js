"use strict"

/*

    ScreenRightEdgePanGestureRecognizer

    Delegate messages:

        onScreenRightEdgePanBegin
        onScreenRightEdgePanMove
        onScreenRightEdgePanComplete
        onScreenRightEdgePanCancelled

*/

ScreenEdgePanGestureRecognizer.newSubclassNamed("ScreenRightEdgePanGestureRecognizer").newSlots({
}).setSlots({
    init: function () {
        ScreenEdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("right")
        return this
    },

})
