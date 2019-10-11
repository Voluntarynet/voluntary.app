"use strict"

/*

    LeftEdgePanGestureRecognizer

    Delegate messages:

        onLeftEdgePanBegin
        onLeftEdgePanMove
        onLeftEdgePanComplete
        onLeftEdgePanCancelled

*/

EdgePanGestureRecognizer.newSubclassNamed("LeftEdgePanGestureRecognizer").newSlots({
}).setSlots({
    init: function () {
        EdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("left")
        return this
    },

})
