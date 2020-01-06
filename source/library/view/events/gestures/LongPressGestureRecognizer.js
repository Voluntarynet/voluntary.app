"use strict"

/*

    LongPressGestureRecognizer

    Recognize a long press and hold in (roughly) one location.

    Notes:

        Should gesture cancel if press moves?:
        
            1. outside of a distance from start point or
            2. outside of the view


    Delegate messages:

        onLongPressBegin
        onLongPressComplete
        onLongPressCancelled

*/

window.LongPressGestureRecognizer = class LongPressGestureRecognizer extends GestureRecognizer {
    
    initPrototype () {
        this.newSlot("timePeriod", 500).setComment("milliseconds")
        this.newSlot("timeoutId", null).setIsPrivate(true)
    }

    init () {
        super.init()
        this.setListenerClasses(this.defaultListenerClasses())
        this.setIsDebugging(false) 

        this.setMinFingersRequired(1)
        this.setMaxFingersAllowed(1)
        this.setMinDistToBegin(null)
        return this
    }

    // --- timer ---

    startTimer () {
        if (this.timeoutId()) {
            this.stopTimer()
        }

        const tid = setTimeout(() => { this.onLongPress() }, this.timePeriod());
        this.setTimeoutId(tid)
        this.startDocListeners() // didFinish will stop listing
        return this
    }

    stopTimer () {
        if (this.hasTimer()) {
            clearTimeout(this.timeoutId());
            this.setTimeoutId(null)
        }
        return this
    }

    hasTimer () {
        return this.timeoutId() !== null
    }

    // -- the completed gesture ---
    
    onLongPress () {
        this.setTimeoutId(null)

        if(this.currentEventIsOnTargetView()) {
            if (this.requestActivationIfNeeded()) {
                this.sendCompleteMessage()
                this.didFinish()
            }
        } else {
            this.cancel()
        }
    }

    // -- single action for mouse and touch up/down ---

    onDown (event) {
        super.onDown(event)
        
        const isWithin = this.currentEventIsOnTargetView();

        if (isWithin && 
            this.hasAcceptableFingerCount() && 
            !GestureManager.shared().hasActiveGesture()) {
            this.startTimer()
            this.sendBeginMessage()
        }
    }

    onMove (event) {
        super.onMove(event)
    
        if (this.hasTimer()) { // TODO: also check move distance?
            if(this.currentEventIsOnTargetView()) {
                this.setCurrentEvent(event)
            } else {
                this.cancel()
            }
        }

    }

    onUp (event) {
        super.onUp(event)

        if (this.hasTimer()) {
            this.cancel()
        }
    }

    cancel () {
        if (this.hasTimer()) {
            this.stopTimer()
            this.sendCancelledMessage()
            this.didFinish()
        }
        return this
    }
    
}.initThisClass()
