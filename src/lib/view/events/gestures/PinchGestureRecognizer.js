"use strict"

/*

    PinchGestureRecognizer

    - on down, note 1st and 2nd fingers
    on move, use noted 1st and 2nd finger for pinch info
        if either disappear, gesture ends

    - track center point of 1st & 2nd finger for translation info

    Delegate messages:

        onPinchBegin
        onPinchMove
        onPinchComplete
        onPinchCancelled

    Helper methods:
        rotationInDegrees
        centerPosition

*/


window.PinchGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "PinchGestureRecognizer",
    isPressing: false,

    minFingersRequired: 2,
    maxFingersAllowed: 4,
    minDistToBegin: 10,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"]) 
        //this.setIsDebugging(true)
        return this
    },

    // events

    onDown: function (event) {
        if (!this.isPressing()) {
            this.setCurrentEvent(event)
            if (this.numberOfFingersDown() >= this.numberOfFingerRequired()) {
                this.setIsPressing(true)
                this.setBeginEvent(event)
                this.startDocListeners()
            }
        }
    },

    canBegin: function() {
        return !this.isActive() && 
                this.hasMovedEnough() && 
                this.numberOfFingersDown() >= this.numberOfFingerRequired() &&
                this.viewTarget().requestActiveGesture(this);
    },

    onMove: function(event) {
        if (this.isPressing()) {
            this.setCurrentEvent(event)

            if (this.canBegin()) {
                this.setIsActive(true)
                this.setBeginEvent(event)
                this.sendBeginMessage()
            }

            if (this.activePoints() < this.numberOfFingerRequired()) {
                this.onUp(event)
                return 
            }
        
            if (this.isActive()) {
                if(this.activeFingers().length >= this.numberOfFingerRequired()) {
                    this.sendMoveMessage()
                } else {
                    this.onUp(event)
                }
            }
        }
    },

    // -----------

    onUp: function (event) {
        if (this.isPressing()) {
            this.setIsPressing(false)
            this.setCurrentEvent(event)
            if (this.isActive()) {
                this.sendCompleteMessage()
            }
            this.didFinish()
        }
    },

    cancel: function() {
        if (this.isActive()) {
            this.sendCancelledMessage()
        }
        this.didFinish()
        return this
    },

    didFinish: function() {
        GestureRecognizer.didFinish.apply(this)
        this.setIsPressing(false)
        this.setIsActive(false)
        this.stopDocListeners()
        return this
    },

    beginPoints: function() {
        let bp = this.pointsForEvent(this.beginEvent())
        return [bp[0], bp[1]]
    },

    activePoints: function() {
        let currentPoints = this.pointsForEvent(this.currentEvent())
        let beginIds = this.beginPoints().map(bp => bp.id())
        return this.currentPoints().select(cp => beginIds.contains(cp.id()) )
    },

    beginAngleInDegress: function() {
        let bp = this.beginPoints()
        let a = bp[0].angleInDegreesTo(bp[1])
        return a
    },

    activeAngleInDegress: function() {
        let ap = this.activePoints()
        let a = ap[0].angleInDegreesTo(ap[1])
        return a
    },

    rotationInDegrees: function() {
        let a1 = this.beginAngleInDegress()
        let a2 = this.activeAngleInDegress()
        return a2 - a2
    },

    beginCenterPosition: function() {
        let p = this.beginPoints()
        let mp = p[0].midpointTo(p[1])
        return mp
    },

    currentCenterPosition: function() {
        let p = this.activePoints()
        let mp = p[0].midpointTo(p[1])
        return mp
    },

})
