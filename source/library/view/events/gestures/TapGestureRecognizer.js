"use strict"

/*

    TapGestureRecognizer

    Recognize a number of taps inside a viewTarget and within a maxHoldPeriod.
        
    On first tap for finger count, start timer. 
    If second tap for finger count occurs before it's expired, it's recognized. 
    Otherwise, restart timer.

    Delegate messages:

        onTapBegin
        onTapComplete
        onTapCancelled

        Typically, delegate will ignore onTapBegin & onTapCancelled.

    The names of the delegate messages can be specified. Example:

        const tg = TapGestureRecognizer.clone()
        tg.setNumberOfTapsRequired(2)
        tg.setNumberOfFingersRequired(2)
        tg.setCompleteMessage("onDoubleFingerDoubleTapComplete")
        this.addGestureRecognizer(tg)

*/

GestureRecognizer.newSubclassNamed("TapGestureRecognizer").newSlots({
    maxHoldPeriod: 1000, // milliseconds per tap
    timeoutId: null, // private

    numberOfTapsRequired: 1,
    numberOfFingersRequired: 1,
    tapCount: 0,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(this.defaultListenerClasses())
        //this.setIsDebugging(true) 
        this.resetTapCount()
        this.setShouldRequestActivation(false) // allow multiple tap targets?
        return this
    },

    resetTapCount: function() {
        this.setTapCount(0)
        return this
    },

    // --- timer ---

    startTimer: function(event) {
        if (this.timeoutId()) {
            this.stopTimer()
        }

        const tid = setTimeout(() => { this.cancel() }, this.maxHoldPeriod());
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
        return this.timeoutId() !== null
    },

    // -- single action for mouse and touch up/down ---

    onDown: function (event) {
        GestureRecognizer.onDown.apply(this, [event])
        
        if (this.numberOfFingersDown() < this.numberOfFingersRequired()) {
            return this
        }

        if (!this.hasTimer()) {
            this.setTapCount(1)
            this.startTimer()
            this.sendBeginMessage() // begin
        } else {
            this.setTapCount(this.tapCount() + 1)
        }

        return true
    },

    onUp: function (event) {
        GestureRecognizer.onUp.apply(this, [event])
 
        if (this.isDebugging()) {
            this.debugLog(".onUp()  tapCount:" + this.tapCount() + " viewTarget:" + this.viewTarget().typeId())
        }

        if (this.hasTimer()) {
            if (this.tapCount() === this.numberOfTapsRequired()) {
                this.stopTimer()
                this.complete()
            }
        } else {
            //this.cancel()
        }
    },

    // end states

    complete: function() {
        this.stopTimer()
        if (this.requestActivationIfNeeded()) {
            this.sendCompleteMessage() // complete
        }
    },

    cancel: function() {
        if (this.hasTimer()) {
            this.stopTimer()
            this.sendCancelledMessage() // cancelled
        }
        return this
    },

    /*
    // was going to do some auto-naming but decided against it for now
    // too many names for point tap count and number of fingers?
    // 3 taps * 10 fingers?

    incrementTapCountForFingerCount: function(n) {
        const d = this.tapCountDict()
        if (n in d) { 
            d[n] ++ 
        } else {
            d[n] = 1
        }
        return this
    },

    
    nameForCount: function(n) {
        if (n === 1) { return "Single" }
        if (n === 2) { return "Double" }
        if (n === 3) { return "Triple"; }
        if (n === 4) { return "Quadruple"; }
        if (n === 5) { return "Quintuple"; }
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

}).initThisProto()
