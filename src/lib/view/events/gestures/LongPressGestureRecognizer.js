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
        this.setListenerClasses(["MouseListener", "TouchListener"])
        //this.setIsDebugging(true) 
        return this
    },

    // --- timer ---

    startTimer: function() {
        if (this.timeoutId()) {
            this.stopTimer()
        }
        let tid = setTimeout(() => { this.onLongPress() }, this.timePeriod());
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
        return this.timeoutId() != null
    },

    // -- the completed gesture ---
    
    onLongPress: function() {
        this.setTimeoutId(null)

        if(this.currentEventIsOnTargetView()) {
            if (this.requestActive()) {
                this.sendCompleteMessage()
                this.didFinish()
            }
        }
    },

    // -- single action for mouse and touch up/down ---

    onDown: function (event) {
        this.setCurrentEvent(event)
        this.setDownEvent(event)
        
        this.startTimer()
        this.setBeginEvent(event)
        this.sendBeginMessage()
    },

    onMove: function (event) {
        if (this.hasTimer()) {
            this.setCurrentEvent(event)
        }
    },

    onUp: function (event) {
        if (this.hasTimer()) {
            this.setCurrentEvent(event)
            this.setUpEvent(event)
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
