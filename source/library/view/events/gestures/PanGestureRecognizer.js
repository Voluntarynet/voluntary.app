"use strict"

/*

    PanGestureRecognizer

    Gesture begins when the minimal number of fingers have moved the minimal distance.
    Will requestActive before beginning.

    Delegate messages:

        onPanBegin
        onPanMove
        onPanComplete
        onPanCancelled

*/

window.PanGestureRecognizer = class PanGestureRecognizer extends GestureRecognizer {
    
    initPrototype () {
        this.newSlot("minNumberOfFingersRequired", 1)
        this.newSlot("maxNumberOfFingersAllowed", 1)
        //downPositionInTarget: null,
    }

    init () {
        super.init()
        this.setListenerClasses(this.defaultListenerClasses()) 
        //this.setIsDebugging(false)
        return this
    }

    // --- events --------------------------------------------------------------------

    // tap events

    hasOkFingerCount () {
        const n = this.numberOfFingersDown()
        const min = this.minNumberOfFingersRequired()
        const max = this.maxNumberOfFingersAllowed()
        return (n >= min && n <= max)
    }

    isReadyToBegin () {
        return this.hasOkFingerCount();
    }

    doPress (event) {
        this.setIsPressing(true)
        this.setDownEvent(event)
        this.startDocListeners()
        return this
    }

    onDown (event) {
        super.onDown(event)

        if (!this.isPressing()) {
            if (this.isReadyToBegin()) {
                this.doPress(event)
            }
        }
        
        return this
    }

    attemptBegin () {
        if (!this.doesTargetAccept()) {
            return;
        }

        if(this.requestActivationIfNeeded()) {
            this.sendBeginMessage() // begin
        } else {
            if (this.isDebugging()) {
                console.log(this.shortTypeId() + ".attemptBegin() FAILED")
            }
        }
    }

    onMove (event) {
        super.onMove(event)

        if (this.isPressing()) {
            if (!this.isActive() && this.hasMovedEnough()) {
                this.attemptBegin()
            }
        
            if (this.isActive()) {
                this.sendMoveMessage() // move
            }
        }
        return this
    }

    onUp (event) {
        super.onUp(event)

        if (this.isPressing()) {
            if (this.isActive()) {
                this.sendCompleteMessage() // complete
            }
            this.didFinish() // will set isPressing to false
        }
        return this
    }

    // ----------------------------------

    cancel () {
        if (this.isActive()) {
            this.sendCancelledMessage()
        }
        this.didFinish()
        return this
    }

    didFinish () {
        super.didFinish()
        this.setIsPressing(false)
        this.stopDocListeners()
        return this
    }

    // ----------------------------------

    hasMovedEnough () {
        const m = this.minDistToBegin()
        const d = this.currentPosition().distanceFrom(this.downPosition())
        return d >= m
    }

    distance () {
        return this.currentPosition().distanceFrom(this.beginPosition())
    }

}.initThisClass()
