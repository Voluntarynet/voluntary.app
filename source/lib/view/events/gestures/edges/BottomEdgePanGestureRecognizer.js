"use strict"

/*

    BottomEdgePanGestureRecognizer

    Delegate messages:

        onBottomEdgePanBegin
        onBottomEdgePanMove
        onBottomEdgePanComplete
        onBottomEdgePanCancelled

*/

EdgePanGestureRecognizer.newSubclassNamed("BottomEdgePanGestureRecognizer").newSlots({
}).setSlots({
    init: function () {
        EdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("bottom")
        return this
    },
})
