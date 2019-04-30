"use strict"

/*

    BottomEdgePanGestureRecognizer

    Delegate messages:

        onBottomEdgePanBegin
        onBottomEdgePanMove
        onBottomEdgePanComplete
        onBottomEdgePanCancelled

*/

window.BottomEdgePanGestureRecognizer = EdgePanGestureRecognizer.extend().newSlots({
    type: "BottomEdgePanGestureRecognizer",
}).setSlots({
    init: function () {
        EdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("bottom")
        return this
    },
})
