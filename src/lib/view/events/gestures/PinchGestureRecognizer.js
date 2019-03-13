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

        points:
            beginPoints // initial 1st two fingers down
            activePoints // current locations of the 1st two fingers down

        position:
            beginCenterPosition //  initial midpoint between 1st two fingers down
            currentCenterPosition // current midpoint between 1st two fingers down
            diffPosition // currentCenterPosition - beginCenterPosition

        rotation:
            activeAngleInDegress // current angle between 1st two fingers down
            rotationInDegrees // difference between initial angle between 1st two fingers down and their current angle

        scale:
            scale // current distance between 1st to fingers down divided by their intitial distance  

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
        this.setIsDebugging(true)
        return this
    },

    // events

    onDown: function (event) {
        if (!this.isPressing()) {
            this.setCurrentEvent(event)
            let downCount = this.numberOfFingersDown()
            if (downCount >= this.minFingersRequired() &&
                downCount <= this.maxFingersAllowed()
            ) {
                this.setIsPressing(true)
                this.setBeginEvent(event)
                this.startDocListeners()
            }
        }
    },

    hasMovedEnough: function() {
        let m = this.minDistToBegin()
        let d = this.currentPosition().distanceFrom(this.downPosition())
        return d >= m
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

    // points - move to GestureRecognizer?

    downPoints: function() {
        let p = this.pointsForEvent(this.downEvent())
        return [p[0], p[1]]
    },

    beginPoints: function() {
        let p = this.pointsForEvent(this.beginEvent())
        return [p[0], p[1]]
    },

    activePoints: function() {
        // looks for two current points whose id matchs those of the two down points
        let currentPoints = this.pointsForEvent(this.currentEvent())
        let ids = this.downPoints().map(p => p.id())
        return currentPoints.select(p => ids.contains(p.id()) )
    },

    // position

    /*
    centerForPoints: function(p) {
        return p[0].midpointTo(p[1])
    },
    */

    downCenterPosition: function() {
        let p = this.downPoints()
        let mp = p[0].midpointTo(p[1])
        return mp
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

    diffPosition: function() {
        return this.currentCenterPosition().subtract(this.beginCenterPosition())
    },

    // rotation

    /*
    angleInDegreesForPoints: function(p) {
        return p[0].angleInDegreesTo(p[1])
    },
    */

    downAngleInDegress: function() {
        let p = this.downPoints()
        let a = p[0].angleInDegreesTo(p[1])
        return a
    },

    beginAngleInDegress: function() {
        let p = this.beginPoints()
        let a = p[0].angleInDegreesTo(p[1])
        return a
    },

    activeAngleInDegress: function() {
        let p = this.activePoints()
        let a = p[0].angleInDegreesTo(p[1])
        return a
    },

    rotationInDegrees: function() {
        // difference between initial angle between 1st two fingers down and their current angle
        let a1 = this.beginAngleInDegress()
        let a2 = this.activeAngleInDegress()
        return a2 - a2
    },

    // scale

    /*
    spreadForPoints: function(p) {
        return p[0].distanceTo(p[1])
    },
    */

    downSpread: function() {
        // initial distance between first two fingers down
        let p = this.downPoints()
        let d = p[0].distanceTo(p[1])
        return d
    },

    beginSpread: function() {
        // initial distance between first two fingers down
        let p = this.beginPoints()
        let d = p[0].distanceTo(p[1])
        return d
    },

    currentSpread: function() {
        // current distance between first two fingers down
        let p = this.activePoints()
        let d = p[0].distanceTo(p[1])
        return d
    },

    scale: function() {
        let s = this.currentSpread()/this.beginSpread()
        return s
    },

})
