"use strict"

/*

    EdgePanGestureRecognizer

    Subclass of PanGestureRecognizer that limits pan detection to gestures starting at the edge fo the view. 
    Don't use this class directed - instead use it's subclass for the edge you're interested in.

    Delegate messages:

        onEdgePanBegin
        onEdgePanMove
        onEdgePanComplete
        onEdgePanCancelled
        
*/

PanGestureRecognizer.newSubclassNamed("EdgePanGestureRecognizer").newSlots({
    edgeName: null,
    maxStartDistance: 15,
}).setSlots({
    init: function () {
        PanGestureRecognizer.init.apply(this)
        this.setListenerClasses(this.defaultListenerClasses()) 
        this.setMinDistToBegin(5)
        //this.setIsDebugging(true)
        return this
    },

    /*
    start: function() {
        this.startDocListeners() // only want to listen to the document
        // TODO: do we always want to listen outside the view? 
        // is listening only inside both more efficient and good enough?
        return this
    },
    */

    // --- events --------------------------------------------------------------------

    /*
    didFinish: function() {
        GestureRecognizer.didFinish.apply(this)
        this.setIsPressing(false)
        this.stopDocListeners()
        return this
    },
    */

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
        const points = this.allPoints() // event points are in document coordinates
        const vt = this.viewTarget()

        if (!vt) {
            this.debugLog(" missing viewTarget")
            return max
        }
        
        const f = vt.frameInDocument()

        // use maxValue to make sure all fingers are close to the edge

        return {
            top:    points.maxValue(p => Math.abs(f.top()    - p.y()), max),
            bottom: points.maxValue(p => Math.abs(f.bottom() - p.y()), max),
            left:   points.maxValue(p => Math.abs(f.left()   - p.x()), max),
            right:  points.maxValue(p => Math.abs(f.right()  - p.x()), max)
        }
    },
})
