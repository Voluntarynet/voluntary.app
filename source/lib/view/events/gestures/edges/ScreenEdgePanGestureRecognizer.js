"use strict"

/*

    ScreenEdgePanGestureRecognizer

    Subclass of PanGestureRecognizer that limits pan detection to gestures starting at the edge. 
    Don't use this class directed - instead use it's subclass for the edge you're interested in.

    Delegate messages:

        onScreenEdgePanBegin
        onScreenEdgePanMove
        onScreenEdgePanComplete
        onScreenEdgePanCancelled

*/

window.ScreenEdgePanGestureRecognizer = PanGestureRecognizer.extend().newSlots({
    type: "ScreenEdgePanGestureRecognizer",
    edgeName: null,
    maxStartDistance: 15,
}).setSlots({
    init: function () {
        PanGestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"]) 
        this.setMinDistToBegin(5)
        //this.setIsDebugging(true)
        return this
    },

    start: function() {
        this.startDocListeners() // only want to listen to the document
        return this
    },

    // --- events --------------------------------------------------------------------

    didFinish: function() {
        GestureRecognizer.didFinish.apply(this)
        this.setIsPressing(false)
        //this.stopDocListeners()
        return this
    },

    isReadyToBegin: function() {
        return this.hasOkFingerCount() &&
                this.distanceFromEdge() <= this.maxStartDistance();
    },

    distanceFromEdge: function() {
        const name = this.edgeName()
        assert(name)
        const d = this.currentEdgeDistances()[name]
        assertDefined(d)
        return d
    },

    // -------------

    maxEdgeDistance: function() {
        return 100000
    },

    currentEdgeDistances: function() {
        const max = this.maxEdgeDistance()
        const points = this.allPoints()
        return {
            top:    points.minValue(p => p.distFromTopOfViewport(),    max),
            bottom: points.minValue(p => p.distFromBottomOfViewport(), max),
            left:   points.minValue(p => p.distFromLeftOfViewport(),   max),
            right:  points.minValue(p => p.distFromRightOfViewport(),  max)
        }
    },
})
