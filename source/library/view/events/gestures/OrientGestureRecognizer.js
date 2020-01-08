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


window.OrientGestureRecognizer = class OrientGestureRecognizer extends GestureRecognizer {

    initPrototype() {

    }

    init() {
        super.init()
        this.setListenerClasses(this.defaultListenerClasses())

        this.setMinFingersRequired(2)
        this.setMaxFingersAllowed(4)
        this.setMinDistToBegin(10)

        //this.setIsDebugging(true)
        return this
    }

    // events

    onDown(event) {
        super.onDown(event)
        //console.log(this.shortTypeId() + ".onDown() this.isPressing() = ", this.isPressing())

        if (!this.isPressing()) {
            const downCount = this.numberOfFingersDown()
            if (downCount >= this.minFingersRequired() &&
                downCount <= this.maxFingersAllowed()
            ) {
                this.setIsPressing(true)
                //this.setBeginEvent(event)
                this.startDocListeners()
            }
        }
    }

    /*
    hasMovedEnough () {
        // intended to be overridden by subclasses
        // e.g. a rotation recognizer might look at how much first two fingers have rotated
        const m = this.minDistToBegin()
        const d = this.currentPosition().distanceFrom(this.downPosition())
        return d >= m
    }

    hasAcceptableFingerCount () {
        const n = this.numberOfFingersDown()
        return  n >= this.minFingersRequired() &&
                n <= this.maxFingersAllowed();
    }

    canBegin () {
        return !this.isActive() && 
                this.hasMovedEnough() && 
                this.hasAcceptableFingerCount();
    }
    */

    onMove(event) {
        super.onMove(event)

        if (this.isPressing()) {
            if (this.canBegin()) {
                if (this.requestActivationIfNeeded()) {
                    this.sendBeginMessage()
                }
            }

            if (this.activePoints().length < this.minFingersRequired()) {
                this.onUp(event)
                return
            }

            if (this.isActive()) {
                if (this.activePoints().length >= this.minFingersRequired()) {
                    this.sendMoveMessage()
                } else {
                    this.onUp(event)
                }
            }
        }
    }

    // -----------

    onUp(event) {
        super.onUp(event)

        if (this.isPressing()) {
            this.setIsPressing(false)
            if (this.isActive()) {
                this.sendCompleteMessage()
            }
            this.didFinish()
        }
    }

    cancel() {
        if (this.isActive()) {
            this.sendCancelledMessage()
        }
        this.didFinish()
        return this
    }

    didFinish() {
        super.didFinish()
        this.setIsPressing(false)
        this.deactivate()
        this.stopDocListeners()
        return this
    }

    // points - move to GestureRecognizer?

    downPoints() {
        const p = this.pointsForEvent(this.downEvent())
        return [p[0], p[1]]
    }

    activeForEvent(event) {
        // looks for two points whose id matchs those of the two down points
        const points = this.pointsForEvent(event)
        const ids = this.downPoints().map(p => p.id())
        return points.select(p => ids.contains(p.id()))
    }

    beginPoints() {
        return this.activeForEvent(this.beginEvent())
    }

    lastPoints() {
        return this.activeForEvent(this.lastEvent())
    }

    activePoints() { // current points that were in down points
        return this.activeForEvent(this.currentEvent())
    }

    // position

    centerForPoints(p) {
        return p[0].midpointTo(p[1])
    }

    downCenterPosition() {
        return this.centerForPoints(this.downPoints())
    }

    beginCenterPosition() {
        return this.centerForPoints(this.beginPoints())
    }

    currentCenterPosition() {
        return this.centerForPoints(this.activePoints())
    }

    diffPosition() {
        return this.currentCenterPosition().subtract(this.beginCenterPosition())
    }

    // rotation

    angleInDegreesForPoints(p) {
        return p[0].angleInDegreesTo(p[1])
    }

    downAngleInDegress() {
        return this.angleInDegreesForPoints(this.downPoints())
    }

    beginAngleInDegress() {
        return this.angleInDegreesForPoints(this.beginPoints())
    }

    activeAngleInDegress() {
        return this.angleInDegreesForPoints(this.activePoints())
    }

    rotationInDegrees() {
        // difference between initial angle between 1st two fingers down and their current angle
        const a1 = this.beginAngleInDegress();
        const a2 = this.activeAngleInDegress();
        return a2 - a2;
    }

    // scale

    spreadForPoints(p) {
        return p[0].distanceFrom(p[1])
    }

    downSpread() {
        // initial distance between first two fingers down
        return this.spreadForPoints(this.downPoints())
    }

    beginSpread() {
        // initial distance between first two fingers down
        return this.spreadForPoints(this.beginPoints())
    }

    currentSpread() {
        // current distance between first two fingers down
        return this.spreadForPoints(this.activePoints())
    }

    spread() {
        const s = this.currentSpread() - this.beginSpread();
        //console.log("spread = " + s + " = " + this.currentSpread() + " - " + this.beginSpread() )
        return s
    }

    downSpreadX() {
        const p = this.downPoints()
        return Math.abs(p[0].x() - p[1].x())
    }

    downSpreadY() {
        const p = this.downPoints()
        return Math.abs(p[0].y() - p[1].y())
    }

    currentSpreadX() {
        const p = this.activePoints()
        return Math.abs(p[0].x() - p[1].x())
    }

    currentSpreadY() {
        const p = this.activePoints()
        return Math.abs(p[0].y() - p[1].y())
    }

    spreadX() {
        return this.currentSpreadX() - this.downSpreadX()
    }

    spreadY() {
        return this.currentSpreadY() - this.downSpreadY()
    }

    scale() {
        const s = this.currentSpread() / this.beginSpread();
        //console.log("scale = " + s + " = " + this.currentSpread() + "/" + this.beginSpread() )
        return s
    }

    // show

    debugJson() {
        const dp = this.diffPosition()
        return {
            id: this.typeId(),
            dx: dp.x(),
            dy: dp.y(),
            scale: this.scale(),
            rotation: this.rotationInDegrees()
        }
    }

    show() {
        console.log(this.debugJson())
    }

}.initThisClass()
