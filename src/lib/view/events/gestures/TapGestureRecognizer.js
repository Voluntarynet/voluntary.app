"use strict"

/*
    TapGestureRecognizer

    Recognize a double tap in (roughly) one location withing timePeriod.

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


    On first tap, start timer. If second tap occurs before it's expired, 
    it's a double tap. Otherwise, restart timer.

    Delegate messages:

        onDoubleTapBegin
        onDoubleTapComplete
        onDoubleTapCancelled

        Typically, delegate will ignore onDoubleTapBegin & onDoubleTapCancelled.

*/


window.TapGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "TapGestureRecognizer",
    maxHoldPeriod: 500, // milliseconds per tap
    timePeriod: 500, // miliseconds from first down event to last up event
    timeoutId: null, // private
    lastEvent: event,

    numberOfTapsRequired: 1,
    numberOfTouchesRequired: 1,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"])
        //this.setIsDebugging(true) 
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
        }
        return this
    },

    hasTimer: function() {
        return this.timeoutId() != null
    },

    // -- the completed gesture ---

    onDoubleTap: function() {
        this.setTimeoutId(null)
        let r = this.viewTarget().requestActiveGesture(this)
        if (r) {
            this.sendDelegateMessage("onDoubleTapComplete")
        }
    },

    // -- single action for mouse and touch up/down ---

    onPressDown: function (event) {
        if (this.hasTimer()) {
            this.onDoubleTap()
        } else {
            this.startTimer()
            this.sendDelegateMessage("onDoubleTapBegin")
        }
        return true
    },

    onPressUp: function (event) {
        return true
    },

    cancel: function() {
        if (this.hasTimer()) {
            this.stopTimer()
            this.sendDelegateMessage("onDoubleTapCancelled")
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
