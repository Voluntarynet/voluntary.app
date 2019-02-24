/*
    LongPressGestureRecognizer

    
*/

"use strict"

window.LongPressGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "LongPressGestureRecognizer",
    tapHoldPeriod: 1000, 
    tapHoldTimeoutId: null,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        return this
    },

    // --- events --------------------------------------------------------------------

    // tap hold event

    startTapHoldTimer: function(event) {
        if (this._tapHoldTimeoutId) {
            this.stopTapHoldTimer()
        }
        this._tapHoldTimeoutId = setTimeout(() => { this.onTapHold(event) }, this.tapHoldPeriod())
        //console.log("startTapHoldTimer id",   this._tapHoldTimeoutId)
        return this
    },

    stopTapHoldTimer: function() {
        if (this._tapHoldTimeoutId) {
            //console.log("stopTapHoldTimer id ",  this._tapHoldTimeoutId)
            clearTimeout(this._tapHoldTimeoutId);
            this._tapHoldTimeoutId = null
        }
        return this
    },

    onTapHold: function(event) {
        this.setCurrentEvent(event)
        this._tapHoldTimeoutId = null
        console.log("onTapHold")
        let t = this.target()
        if (t) {
            if (t.onTapHoldGesture) {
                t.onTapHoldGesture(this)
            }
        }
    },

    // tap events

    onTapDown: function (event) {
        if (this.tapHoldPeriod()) {
            this.startTapHoldTimer(event)
        }
        return true
    },

    onTapUp: function (event) {
        if (this.tapHoldPeriod()) {
            this.stopTapHoldTimer()
        }
        return true
    },


    // mouse events

    onMouseDown: function (event) {
        GestureRecognizer.onMouseDown.apply(this, [event])
        return this.onTapDown(event)
    },

    onMouseUp: function (event) {
        GestureRecognizer.onMouseUp.apply(this, [event])
        return this.onTapUp(event)
    },

    // touch events

    onTouchStart: function(event) {
        GestureRecognizer.onTouchStart.apply(this, [event])
        return this.onTapDown(event)
    },

	
    onTouchCancel: function(event) {
        GestureRecognizer.onTouchCancel.apply(this, [event])
        return this.onTapUp(event)
    },
	
    onTouchEnd: function(event) {
        GestureRecognizer.onTouchEnd.apply(this, [event])
        return this.onTapUp(event)
    },	

    // --- keyboard events ---
    
    /*
    onKeyDown: function (event) {
        GestureRecognizer.onKeyDown.apply(this, [event])
        return this.onTapDown(event)
    },
    
    onKeyUp: function (event) {
        GestureRecognizer.onKeyUp.apply(this, [event])
        return this.onTapUp(event)
    },
    */

})
