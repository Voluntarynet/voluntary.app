"use strict"

/*
    TapGestureRecognizer

    Recognize a number of taps in a viewTarget within a timePeriod.

    Event sequence:
    
        down event(s)
        < maxHoldPeriod
        up event(s)
        < maxBetweenPeriod
        down event(s)
        < maxHoldPeriod
        up event(s)

    Questions:

        Track touch ids for multi-touch?

        onDown:
        let targetStartedTouches = event.touches.select(t => t.target = this.viewTarget());
        if 
        

    On first tap, start timer. If second tap occurs before it's expired, 
    it's a double tap. Otherwise, restart timer.

    Delegate messages:

        onTapBegin
        onTapComplete
        onTapCancelled

        Typically, delegate will ignore onTapBegin & onTapCancelled.

*/

window.TapGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "TapGestureRecognizer",
    maxHoldPeriod: 500, // milliseconds per tap
    timePeriod: 500, // miliseconds from first down event to last up event
    timeoutId: null, // private
    lastEvent: event,

    numberOfTapsRequired: 3,
    numberOfFingersRequired: 1,
    tapCount: 0,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"])
        this.setIsDebugging(true) 
        return this
    },

    // --- timer ---

    startTimer: function(event) {
        if (this.timeoutId()) {
            this.stopTimer()
        }
        let tid = setTimeout(() => { this.cancel() }, this.timePeriod());
        this.setTimeoutId(tid)
        return this
    },

    stopTimer: function() {
        if (this.hasTimer()) {
            clearTimeout(this.timeoutId());
            this.setTimeoutId(null)
            this.setTapCount(0)
        }
        return this
    },

    hasTimer: function() {
        return this.timeoutId() != null
    },

    // -- the completed gesture ---

    complete: function() {
        this.stopTimer()
        let r = this.viewTarget().requestActiveGesture(this)
        if (r) {
            this.sendDelegateMessage("onTapComplete")
        }
    },

    // -- single action for mouse and touch up/down ---

    hasEnoughFingersOnEvent: function(event) {
        // if touch event, make sure it has enough fingers
        if (event.touches) {
            let targetStartedTouches = event.touches.select(t => t.target = this.viewTarget());
            return (targetStartedTouches.length >= this.numberOfFingersRequired())
        }

        // otherwise, the device only supports 1 "finger"? 
        // Or should we count mouse buttons as fingers?
        return this.numberOfFingersRequired() == 1
    },

    onPressDown: function (event) {
        if (!this.hasEnoughFingersOnEvent(event)) {
            return this
        }

        if (!this.hasTimer()) {
            this.setTapCount(1)
            this.startTimer()
            this.sendDelegateMessage("onTapBegin")
        } else {
            this.setTapCount(this.tapCount() + 1)
        }

        if (this.tapCount() == this.numberOfTapsRequired()) {
            this.complete()
        }

        return true
    },

    onPressUp: function (event) {
        return true
    },

    cancel: function() {
        if (this.hasTimer()) {
            this.stopTimer()
            this.sendDelegateMessage("onTapCancelled")
        }
        return this
    },

    // --- events --------------------------------------------------------------------

    // mouse events

    onMouseDown: function (event) {
        return this.onPressDown(event)
    },

    onMouseUp: function (event) {
        return this.onPressUp(event)
    },

    /*
    onMouseUpCapture: function (event) {
        return this.onPressUp(event)
    },
    */

    // touch events

    onTouchStart: function(event) {
        return this.onPressDown(event)
    },

    onTouchEnd: function(event) {
        return this.onPressUp(event)
    },	

    // touch capture

    /*
    onTouchMoveCapture: function(event) {
        //return this.onPressUp(event)
    },

    onTouchCancelCapture: function(event) {
        //return this.onPressUp(event)
    },
	
    onTouchEndCapture: function(event) {
        //return this.onPressUp(event)
    },	
    */

})
