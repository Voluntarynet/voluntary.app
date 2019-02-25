/*
    LongPressGestureRecognizer

    
*/

"use strict"

window.LongPressGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "LongPressGestureRecognizer",
    pressHoldPeriod: 1000, 
    pressHoldTimeoutId: null,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"]) 
        return this
    },

    // --- timer ---

    startPressHoldTimer: function(event) {
        if (this._pressHoldTimeoutId) {
            this.stopPressHoldTimer()
        }
        this._pressHoldTimeoutId = setTimeout(() => { this.onPressHold(event) }, this.pressHoldPeriod())
        //console.log("startPressHoldTimer id",   this._pressHoldTimeoutId)
        return this
    },

    stopPressHoldTimer: function() {
        if (this._pressHoldTimeoutId) {
            //console.log("stopPressHoldTimer id ",  this._pressHoldTimeoutId)
            clearTimeout(this._pressHoldTimeoutId);
            this._pressHoldTimeoutId = null
        }
        return this
    },

    // -- the completed gesture ---

    onPressHold: function(event) {
        this.setCurrentEvent(event)
        this._pressHoldTimeoutId = null
        console.log("onPressHold")
        let t = this.viewTarget()
        if (t) {
            if (t.onPressHoldGesture) {
                t.onPressHoldGesture(this)
            }
        }
    },

    // -- single action for mouse and touch up/down ---

    onPressDown: function (event) {
        this.startPressHoldTimer(event)
        return true
    },

    onPressUp: function (event) {
        this.stopPressHoldTimer()
        return true
    },

    // --- events --------------------------------------------------------------------

    // mouse events

    onMouseDown: function (event) {
        return this.onPressDown(event)
    },

    onMouseUpCapture: function (event) {
        return this.onPressUp(event)
    },

    // touch events

    onTouchStart: function(event) {
        return this.onPressDown(event)
    },

    onTouchCancelCapture: function(event) {
        return this.onPressUp(event)
    },
	
    onTouchEndCapture: function(event) {
        return this.onPressUp(event)
    },	

})
