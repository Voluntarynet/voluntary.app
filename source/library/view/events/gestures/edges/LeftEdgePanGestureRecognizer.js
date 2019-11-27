"use strict"

/*

    LeftEdgePanGestureRecognizer

    Delegate messages:

        onLeftEdgePanBegin
        onLeftEdgePanMove
        onLeftEdgePanComplete
        onLeftEdgePanCancelled

*/

window.LeftEdgePanGestureRecognizer = class LeftEdgePanGestureRecognizer extends ProtoClass {
    
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
