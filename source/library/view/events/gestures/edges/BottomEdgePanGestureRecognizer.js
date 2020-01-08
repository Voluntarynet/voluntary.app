"use strict"

/*

    BottomEdgePanGestureRecognizer

    Delegate messages:

        onBottomEdgePanBegin
        onBottomEdgePanMove
        onBottomEdgePanComplete
        onBottomEdgePanCancelled

*/

window.BottomEdgePanGestureRecognizer = class BottomEdgePanGestureRecognizer extends EdgePanGestureRecognizer {
    
    initPrototype () {

    }

    init () {
        super.init()
        this.setEdgeName("bottom")
        return this
    }
    
}.initThisClass()
