"use strict"

/*

    RightEdgePanGestureRecognizer

    Delegate messages:

        onRightEdgePanBegin
        onRightEdgePanMove
        onRightEdgePanComplete
        onRightEdgePanCancelled

*/

window.RightEdgePanGestureRecognizer = class RightEdgePanGestureRecognizer extends ProtoClass {
    
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
