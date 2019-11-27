"use strict"

/*

    ScreenTopEdgePanGestureRecognizer

    Delegate messages:

        onScreenTopEdgePanBegin
        onScreenTopEdgePanMove
        onScreenTopEdgePanComplete
        onScreenTopEdgePanCancelled

*/

window.ScreenTopEdgePanGestureRecognizer = class ScreenTopEdgePanGestureRecognizer extends ScreenEdgePanGestureRecognizer {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.setEdgeName("top")
        return this
    }

}.initThisClass()
