"use strict"

/*

    ScreenBottomEdgePanGestureRecognizer

    Delegate messages:

        onScreenBottomEdgePanBegin
        onScreenBottomEdgePanMove
        onScreenBottomEdgePanComplete
        onScreenBottomEdgePanCancelled

*/

window.ScreenBottomEdgePanGestureRecognizer = ScreenEdgePanGestureRecognizer.extend().newSlots({
    type: "ScreenBottomEdgePanGestureRecognizer",
}).setSlots({
    init: function () {
        ScreenEdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("bottom")
        return this
    },

})
