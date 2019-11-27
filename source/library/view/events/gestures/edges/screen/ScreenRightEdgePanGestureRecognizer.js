"use strict"

/*

    ScreenRightEdgePanGestureRecognizer

    Delegate messages:

        onScreenRightEdgePanBegin
        onScreenRightEdgePanMove
        onScreenRightEdgePanComplete
        onScreenRightEdgePanCancelled

*/

window.ScreenRightEdgePanGestureRecognizer = class ScreenRightEdgePanGestureRecognizer extends ScreenEdgePanGestureRecognizer {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.setEdgeName("right")
        return this
    }

}.initThisClass()
