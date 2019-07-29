"use strict"

/*

    ScreenBottomEdgePanGestureRecognizer

    Delegate messages:

        onScreenBottomEdgePanBegin
        onScreenBottomEdgePanMove
        onScreenBottomEdgePanComplete
        onScreenBottomEdgePanCancelled

*/

ScreenEdgePanGestureRecognizer.newSubclassNamed("ScreenBottomEdgePanGestureRecognizer").newSlots({
}).setSlots({
    init: function () {
        ScreenEdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("bottom")
        return this
    },

})
