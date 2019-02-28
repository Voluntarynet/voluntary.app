"use strict"

/*
    TapGestureRecognizer

    Recognize a number of taps inside a viewTarget and within a timePeriod.
        
    On first tap for finger count, start timer. 
    If second tap for finger count occurs before it's expired, it's recognized. 
    Otherwise, restart timer.

    Delegate messages:

        onTapBegin
        onTapComplete
        onTapCancelled

        Typically, delegate will ignore onTapBegin & onTapCancelled.

    The names of the delegate messages can be specified. Example:

        let tg = TapGestureRecognizer.clone()
        tg.setNumberOfTapsRequired(2)
        tg.setNumberOfFingerRequired(2)
        tg.setCompleteMessage("onDoublFingerDoubleTapComplete")
        this.addGestureRecognizer(tg)

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
    tapCountDict: null,

    beginMessage: "onTapBegin",
    cancelledMessage: "onTapCancelled",
    completeMessage: "onTapComplete",
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"])
        //this.setIsDebugging(true) 
        this.resetTapCount()
        return this
    },

    resetTapCount: function() {
        this.setTapCount(0)
        //this.setTapCountDict({})
        return this
    },

    /*
    // was going to do some auto-naming but decided against it for now
    // too many names for point tap count and number of fingers?
    // 3 taps * 10 fingers?

    incrementTapCountForFingerCount: function(n) {
        let d = this.tapCountDict()
        if (n in d) { 
            d[n] ++ 
        } else {
            d[n] = 1
        }
        return this
    },

    
    nameForCount: function(n) {
        if (n == 1) { return "Single" }
        if (n == 2) { return "Double" }
        if (n == 3) { return "Triple"; }
        if (n == 4) { return "Quadruple"; }
        if (n == 5) { return "Quintuple"; }
        return "Many"
    },
    beginMessageForCount: function(n) {
        return "on" + this.nameForCount(n) + "TapBegin"
    },

    completeMessageForCount: function(n) {
        return "on" + this.nameForCount(n) + "TapComplete"
    },

    cancelledMessageForCount: function(n) {
        return "on" + this.nameForCount(n) + "TapCancelled"
    },
    */

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
            this.resetTapCount()
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
            this.sendDelegateMessage(this.completeMessage())
            //this.completeMessageForCount(this.numberOfTapsRequired())
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
            this.sendDelegateMessage(this.beginMessage())
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
            this.sendDelegateMessage(this.cancelledMessage())
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
