"use strict"

/*
    PanGestureRecognizer

    Gesture begins when the minimal number of fingers have moved the minimal distance.

    Delegate messages:

    onPanBegin
    onPanMove
    onPanComplete
    onPanCancelled

*/

window.PanGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "PanGestureRecognizer",
    isPressing: false,

    minNumberOfFingersRequired: 1,
    maxNumberOfFingersAllowed: 1,
    minDistToBegin: 10,

    //downPositionInTarget: null,
    downPosition: null, // where to start measuring if we've moved enough to begin
    beginPosition: null, // where pan began
    currentPosition: null,
    upPosition: null,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"]) 
        1//this.setIsDebugging(true)
        return this
    },

    // --- events --------------------------------------------------------------------

    // tap events

    onDown: function (event) {
        if (!this.isPressing()) {
            this.setCurrentEvent(event)
            let points = this.pointsForEvent(event)
            if (points.length >= this.minNumberOfFingersRequired() &&
                points.length <= this.maxNumberOfFingersAllowed()) {
                this.setIsPressing(true)
                let pos = points.first()
                this.setCurrentPosition(pos)
                this.setDownPosition(pos)
                //this.setDownPositionInTarget(this.viewTarget().windowPos())
                this.startDocListeners()
            }
        }
        return this
    },

    onMove: function(event) {
        if (this.isPressing()) {
            let pos = this.pointsForEvent(event).first()
            this.setCurrentPosition(pos)

            if (!this.isActive() && this.hasMovedEnough()) {
                this.setBeginPosition(pos)
                let vt = this.viewTarget()
                let r = vt.requestActiveGesture(this)
                if(r) {
                    this.setIsActive(true)
                    this.sendDelegateMessage("onPanBegin")
                }
            }
        
            if (this.isActive()) {
                this.sendDelegateMessage("onPanMove")
            }
        }
        return this
    },

    onUp: function (event) {
        //let points = this.pointsForEvent(event)
        if (this.isPressing()) {
            this.setIsPressing(false)

            let pos = this.pointsForEvent(event).first()
            this.setUpPosition(pos)
            this.setCurrentPosition(pos)

            if (this.isActive()) {
                this.sendDelegateMessage("onPanComplete")
            }
            this.finish()
        }
        return this
    },

    // ----------------------------------

    cancel: function() {
        if (this.isActive()) {
            this.sendDelegateMessage("onPanCancelled")
        }
        this.finish()
        return this
    },

    finish: function() {
        //console.log(this.type() + ".finish()")
        this.setIsActive(false)
        this.stopDocListeners()
        this.didFinish()
        return this
    },

    // ----------------------------------

    hasMovedEnough: function() {
        let m = this.minDistToBegin()
        let d = this.currentPosition().distanceFrom(this.downPosition())
        return d >= m
    },

    // ------------------------------

    diffPos: function() {
        return this.currentPosition().subtract(this.beginPosition()).floorInPlace() // floor here?
    },

    // --- mouse events ---

    onMouseDown: function (event) {
        return this.onDown(event)
    },

    onMouseMoveCapture: function(event) {
        this.onMove(event)
    },

    onMouseUpCapture: function (event) {
        return this.onUp(event)
    },

    // --- touch events ---

    onTouchStart: function(event) {
        return this.onDown(event)
    },

    onTouchMoveCapture: function(event) {
        return this.onMove(event)
    },

    onTouchCancelCapture: function(event) {
        return this.onCancel(event)
    },
	
    onTouchEndCapture: function(event) {
        return this.onUp(event)
    },	

    // --- helpers ----

    distance: function() {
        let dp = this.diffPos()
        let dx = Math.abs(dp.x())
        let dy = Math.abs(dp.y())
        let funcs = {
            left:  (dx, dy) => dx,
            right: (dx, dy) => dx,
            up:    (dx, dy) => dy,
            down:  (dx, dy) => dy
        }
        return funcs[this.direction()](dx, dy)
    },
})
