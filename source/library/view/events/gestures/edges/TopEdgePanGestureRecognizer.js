"use strict"

/*

    TopEdgePanGestureRecognizer

    Delegate messages:

        onTopEdgePanBegin
        onTopEdgePanMove
        onTopEdgePanComplete
        onTopEdgePanCancelled

*/

window.TopEdgePanGestureRecognizer = class TopEdgePanGestureRecognizer extends EdgePanGestureRecognizer {
    
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
