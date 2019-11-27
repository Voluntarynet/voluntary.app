"use strict"

/*

    ScreenLeftEdgePanGestureRecognizer

    Delegate messages:

        onScreenLeftEdgePanBegin
        onScreenLeftEdgePanMove
        onScreenLeftEdgePanComplete
        onScreenLeftEdgePanCancelled

*/

window.ScreenLeftEdgePanGestureRecognizer = class ScreenLeftEdgePanGestureRecognizer extends ScreenEdgePanGestureRecognizer {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.setEdgeName("left")
        return this
    }

}.initThisClass()
