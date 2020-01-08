"use strict"

/*

    RightEdgePanGestureRecognizer

    Delegate messages:

        onRightEdgePanBegin
        onRightEdgePanMove
        onRightEdgePanComplete
        onRightEdgePanCancelled

*/

window.RightEdgePanGestureRecognizer = class RightEdgePanGestureRecognizer extends EdgePanGestureRecognizer {
    
    initPrototype () {

    }

    init () {
        super.init()
        this.setEdgeName("right")
        return this
    }

}.initThisClass()
