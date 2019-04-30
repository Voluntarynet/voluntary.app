"use strict"

/*

    TopEdgePanGestureRecognizer

    Delegate messages:

        onTopEdgePanBegin
        onTopEdgePanMove
        onTopEdgePanComplete
        onTopEdgePanCancelled

*/

window.TopEdgePanGestureRecognizer = EdgePanGestureRecognizer.extend().newSlots({
    type: "TopEdgePanGestureRecognizer",
}).setSlots({
    init: function () {
        EdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("top")
        return this
    },

})
