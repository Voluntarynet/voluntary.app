"use strict"

/*

    BottomEdgePanGestureRecognizer

    Delegate messages:

        onBottomEdgePanBegin
        onBottomEdgePanMove
        onBottomEdgePanComplete
        onBottomEdgePanCancelled

*/

window.BottomEdgePanGestureRecognizer = class BottomEdgePanGestureRecognizer extends ProtoClass {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.setEdgeName("bottom")
        return this
    }
    
}.initThisClass()
