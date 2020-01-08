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
    }

    init () {
        super.init()
        this.setEdgeName("top")
        return this
    }

}.initThisClass()
