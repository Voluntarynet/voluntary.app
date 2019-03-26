"use strict"

/*

    OrientGestureRecognizer

    - on down, note 1st and 2nd fingers
    - on move, use noted 1st and 2nd finger for pinch info
        if either disappear, gesture ends

    - track center point of 1st & 2nd finger for translation info

    Delegate messages:

        onOrientBegin
        onOrientMove
        onOrientComplete
        onOrientCancelled

    Helper methods:

        points:
            downPoints // initial 1st two fingers down
            beginPoints // location (of 1st two fingers down) when gesture began
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


window.OrientGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "OrientGestureRecognizer",
    isPressing: false,

    minFingersRequired: 2,
    maxFingersAllowed: 4,
    minDistToBegin: 10,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"]) 
        this.setIsDebugging(false)
        return this
    },

    // events

    onDown: function (event) {
        GestureRecognizer.onDown.apply(this, [event])

        if (!this.isPressing()) {
            //console.log("this.numberOfFingersDown() = ", this.numberOfFingersDown())
            //console.log("this.minFingersRequired() = ", this.minFingersRequired())
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
        // intended to be overridden by subclasses
        let m = this.minDistToBegin()
        let d = this.currentPosition().distanceFrom(this.downPosition())
        return d >= m
    },

    canBegin: function() {
        return !this.isActive() && 
                this.hasMovedEnough() && 
                this.numberOfFingersDown() >= this.minFingersRequired() &&
                this.requestActivation(); // TODO: should this be in a "can" method?
    },

    onMove: function(event) {
        GestureRecognizer.onMove.apply(this, [event])

        if (this.isPressing()) {
            //console.log(this.typeId() + " canBegin: ", this.canBegin())

            if (this.canBegin()) {
                this.setIsActive(true)
                this.setBeginEvent(event)
                this.sendBeginMessage()
            }

            if (this.activePoints().length < this.minFingersRequired()) {
                this.onUp(event)
                return 
            }
        
            if (this.isActive()) {
                if(this.activePoints().length >= this.minFingersRequired()) {
                    this.sendMoveMessage()
                } else {
                    this.onUp(event)
                }
            }
        }
    },

    // -----------

    onUp: function (event) {
        GestureRecognizer.onUp.apply(this, [event])

        if (this.isPressing()) {
            this.setIsPressing(false)
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
        this.deactivate()
        this.stopDocListeners()
        return this
    },

    // points - move to GestureRecognizer?

    downPoints: function() {
        const p = this.pointsForEvent(this.downEvent())
        return [p[0], p[1]]
    },

    activeForEvent: function(event) {
        // looks for two points whose id matchs those of the two down points
        const points = this.pointsForEvent(event)
        const ids = this.downPoints().map(p => p.id())
        return points.select(p => ids.contains(p.id()) )
    },

    beginPoints: function() {
        return this.activeForEvent(this.beginEvent())
    },

    lastPoints: function() {
        return this.activeForEvent(this.lastEvent())
    },

    activePoints: function() {
        return this.activeForEvent(this.currentEvent())
    },

    // position

    centerForPoints: function(p) {
        return p[0].midpointTo(p[1])
    },

    downCenterPosition: function() {
        return this.centerForPoints(this.downPoints())
    },

    beginCenterPosition: function() {
        return this.centerForPoints(this.beginPoints())
    },

    currentCenterPosition: function() {
        return this.centerForPoints(this.activePoints())
    },

    diffPosition: function() {
        return this.currentCenterPosition().subtract(this.beginCenterPosition())
    },

    // rotation

    angleInDegreesForPoints: function(p) {
        return p[0].angleInDegreesTo(p[1])
    },

    downAngleInDegress: function() {
        return this.angleInDegreesForPoints(this.downPoints())
    },

    beginAngleInDegress: function() {
        return this.angleInDegreesForPoints(this.beginPoints())
    },

    activeAngleInDegress: function() {
        return this.angleInDegreesForPoints(this.activePoints())
    },

    rotationInDegrees: function() {
        // difference between initial angle between 1st two fingers down and their current angle
        const a1 = this.beginAngleInDegress();
        const a2 = this.activeAngleInDegress();
        return a2 - a2;
    },

    // scale

    spreadForPoints: function(p) {
        return p[0].distanceFrom(p[1])
    },

    downSpread: function() {
        // initial distance between first two fingers down
        return this.spreadForPoints(this.downPoints())
    },

    beginSpread: function() {
        // initial distance between first two fingers down
        return this.spreadForPoints(this.beginPoints())
    },

    currentSpread: function() {
        // current distance between first two fingers down
        return this.spreadForPoints(this.activePoints())
    },

    spread: function() {
        let s = this.currentSpread() - this.beginSpread();
        //console.log("spread = " + s + " = " + this.currentSpread() + " - " + this.beginSpread() )
        return s
    },

    scale: function() {
        let s = this.currentSpread() / this.beginSpread();
        //console.log("scale = " + s + " = " + this.currentSpread() + "/" + this.beginSpread() )
        return s
    },

    // show

    debugJson: function() {
        const dp = this.diffPosition()
        return {
            id: this.typeId(),
            dx: dp.x(),
            dy: dp.y(),
            scale: this.scale(),
            rotation: this.rotationInDegrees()
        }
    },

    show: function() {
        console.log(this.debugJson())
    },

})
