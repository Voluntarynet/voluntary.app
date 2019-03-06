"use strict"

/*

    PanGestureRecognizer

    Gesture begins when the minimal number of fingers have moved the minimal distance.
    Will requestActiveGesture before beginning.

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
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"]) 
        //this.setIsDebugging(true)
        return this
    },

    // --- events --------------------------------------------------------------------

    // tap events

    onDown: function (event) {
        console.log(this.type() + ".onDown()")

        if (this.isPressing()) {
            console.warn(this.type() + ".onDown() isPressing")
        }

        if (this.isActive()) {
            console.warn(this.type() + ".onDown() isActive")
        }

        if (!this.isPressing()) {
            this.setCurrentEvent(event)
            let fingers = this.currentFingersDown()
            if (fingers >= this.minNumberOfFingersRequired() &&
                fingers <= this.maxNumberOfFingersAllowed()) {
                this.setIsPressing(true)
                this.setDownEvent(event)
                //this.setDownPositionInTarget(this.viewTarget().windowPos())
                this.startDocListeners()
            }
        }
        return this
    },

    onMove: function(event) {
        if (this.isPressing()) {
            this.setCurrentEvent(event)

            if (!this.isActive() && this.hasMovedEnough()) {
                let vt = this.viewTarget()
                let r = vt.requestActiveGesture(this)
                if(r) {
                    this.setIsActive(true)
                    this.setBeginEvent(event)
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
            this.setCurrentEvent(event)

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
        this.setIsPressing(false)
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

    distance: function() {
        return this.currentPosition().distanceFrom(this.beginPosition())
    },

})
