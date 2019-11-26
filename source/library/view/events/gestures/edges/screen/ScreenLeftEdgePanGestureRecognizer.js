"use strict"

/*

    ScreenLeftEdgePanGestureRecognizer

    Delegate messages:

        onScreenLeftEdgePanBegin
        onScreenLeftEdgePanMove
        onScreenLeftEdgePanComplete
        onScreenLeftEdgePanCancelled

*/

ScreenEdgePanGestureRecognizer.newSubclassNamed("ScreenLeftEdgePanGestureRecognizer").newSlots({
}).setSlots({
    init: function () {
        ScreenEdgePanGestureRecognizer.init.apply(this)
        this.setEdgeName("left")
        return this
    },

}).initThisProto()
