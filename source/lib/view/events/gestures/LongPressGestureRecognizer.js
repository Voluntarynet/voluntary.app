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

window.LongPressGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "LongPressGestureRecognizer",
    timePeriod: 500, // miliseconds
    timeoutId: null, // private
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(this.defaultListenerClasses())
        this.setIsDebugging(false) 

        this.setMinFingersRequired(1)
        this.setMaxFingersAllowed(1)
        this.setMinDistToBegin(null)
        return this
    },

    // --- timer ---

    startTimer: function() {
        if (this.timeoutId()) {
            this.stopTimer()
        }

        const tid = setTimeout(() => { this.onLongPress() }, this.timePeriod());
        this.setTimeoutId(tid)
        this.startDocListeners() // didFinish will stop listing
        return this
    },

    stopTimer: function() {
        if (this.hasTimer()) {
            clearTimeout(this.timeoutId());
            this.setTimeoutId(null)
        }
        return this
    },

    hasTimer: function() {
        return this.timeoutId() !== null
    },

    // -- the completed gesture ---
    
    onLongPress: function() {
        this.setTimeoutId(null)

        if(this.currentEventIsOnTargetView()) {
            if (this.requestActivation()) {
                this.sendCompleteMessage()
                this.didFinish()
            }
        } else {
            this.cancel()
        }
    },

    // -- single action for mouse and touch up/down ---

    onDown: function (event) {
        GestureRecognizer.onDown.apply(this, [event])
        
        const isWithin = this.currentEventIsOnTargetView();

        if (isWithin && 
            this.hasAcceptableFingerCount() && 
            !GestureManager.shared().hasActiveGesture()) {
            this.startTimer()
            this.sendBeginMessage()
        }
    },

    onMove: function (event) {
        GestureRecognizer.onMove.apply(this, [event])
    
        if (this.hasTimer()) { // TODO: also check move distance?
            if(this.currentEventIsOnTargetView()) {
                this.setCurrentEvent(event)
            } else {
                this.cancel()
            }
        }

    },

    onUp: function (event) {
        GestureRecognizer.onUp.apply(this, [event])

        if (this.hasTimer()) {
            this.cancel()
        }
    },

    cancel: function() {
        if (this.hasTimer()) {
            this.stopTimer()
            this.sendCancelledMessage()
            this.didFinish()
        }
        return this
    },
})
