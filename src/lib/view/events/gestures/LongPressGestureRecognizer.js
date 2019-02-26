"use strict"

/*
    LongPressGestureRecognizer

    Notes:

        Should gesture cancel if press moves:
        
            1. outside of a distance from start point or
            2. outside of the view


    Delegate messages:

        onLongPressBegin
        onLongPressGestureComplete
        onLongPressGestureCancelled

    
*/


window.LongPressGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "LongPressGestureRecognizer",
    pressHoldPeriod: 1000, 
    timeoutId: null,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"])
        this.setIsDebugging(true) 
        return this
    },

    // --- timer ---

    startPressHoldTimer: function(event) {
        if (this.timeoutId()) {
            this.stopTimer()
        }
        let tid = setTimeout(() => { this.onLongPress(event) }, this.pressHoldPeriod());
        this.setTimeoutId(tid)
        //console.log("startPressHoldTimer id",   this.timeoutId())
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

    onLongPress: function(event) {
        this.setCurrentEvent(event)
        this.setTimeoutId(null)
        this.sendDelegateMessage("onLongPressGestureComplete")
    },

    // -- single action for mouse and touch up/down ---

    onPressDown: function (event) {
        this.startPressHoldTimer(event)
        this.sendDelegateMessage("onLongPressGestureBegin")
        return true
    },

    onPressUp: function (event) {
        this.cancel()
        return true
    },

    cancel: function() {
        if (this.hasTimer()) {
            this.stopTimer()
            this.sendDelegateMessage("onLongPressGestureCancelled")
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
