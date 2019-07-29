"use strict"

/*

    RightEdgePanGestureRecognizer

    Delegate messages:

        onRightEdgePanBegin
        onRightEdgePanMove
        onRightEdgePanComplete
        onRightEdgePanCancelled

*/

EdgePanGestureRecognizer.newSubclassNamed("RightEdgePanGestureRecognizer").newSlots({
}).setSlots({
    init: function () {
        EdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("right")
        return this
    },

})
