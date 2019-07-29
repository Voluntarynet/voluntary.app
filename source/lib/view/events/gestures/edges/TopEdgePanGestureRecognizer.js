"use strict"

/*

    TopEdgePanGestureRecognizer

    Delegate messages:

        onTopEdgePanBegin
        onTopEdgePanMove
        onTopEdgePanComplete
        onTopEdgePanCancelled

*/

EdgePanGestureRecognizer.newSubclassNamed("TopEdgePanGestureRecognizer").newSlots({
}).setSlots({
    init: function () {
        EdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("top")
        return this
    },

})
