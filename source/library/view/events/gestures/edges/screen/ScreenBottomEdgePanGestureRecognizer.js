"use strict"

/*

    ScreenBottomEdgePanGestureRecognizer

    Delegate messages:

        onScreenBottomEdgePanBegin
        onScreenBottomEdgePanMove
        onScreenBottomEdgePanComplete
        onScreenBottomEdgePanCancelled

*/

window.ScreenBottomEdgePanGestureRecognizer = class ScreenBottomEdgePanGestureRecognizer extends ScreenEdgePanGestureRecognizer {
    
    initPrototype () {

    }

    init () {
        super.init()
        this.setEdgeName("bottom")
        return this
    }

}.initThisClass()
