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

window.TapGestureRecognizer = class TapGestureRecognizer extends GestureRecognizer {
    
    initPrototype () {
        this.newSlot("maxHoldPeriod", 1000).setComment("milliseconds per tap")
        this.newSlot("timeoutId", null) // private
        this.newSlot("numberOfTapsRequired", 1)
        this.newSlot("numberOfFingersRequired", 1)
        this.newSlot("tapCount", 0)
    }

    init () {
        super.init()
        this.setListenerClasses(this.defaultListenerClasses())
        //this.setIsDebugging(true) 
        this.resetTapCount()
        this.setShouldRequestActivation(false) // allow multiple tap targets?
        return this
    }

    resetTapCount () {
        this.setTapCount(0)
        return this
    }

    // --- timer ---

    startTimer (event) {
        if (this.timeoutId()) {
            this.stopTimer()
        }

        const tid = setTimeout(() => { this.cancel() }, this.maxHoldPeriod());
        this.setTimeoutId(tid)
        return this
    }

    stopTimer () {
        if (this.hasTimer()) {
            clearTimeout(this.timeoutId());
            this.setTimeoutId(null)
            this.resetTapCount()
        }
        return this
    }

    hasTimer () {
        return this.timeoutId() !== null
    }

    // -- single action for mouse and touch up/down ---

    onDown (event) {
        super.onDown(event)
        
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
    }

    onUp (event) {
        super.onUp(event)
 
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
    }

    // end states

    complete () {
        this.stopTimer()
        if (this.requestActivationIfNeeded()) {
            this.sendCompleteMessage() // complete
        }
    }

    cancel () {
        if (this.hasTimer()) {
            this.stopTimer()
            this.sendCancelledMessage() // cancelled
        }
        return this
    }

    /*
    // was going to do some auto-naming but decided against it for now
    // too many names for point tap count and number of fingers?
    // 3 taps * 10 fingers?

    incrementTapCountForFingerCount (n) {
        const d = this.tapCountDict()
        if (d.hasOwnProperty(n)) { 
            d.atPut(n, d.at(n)+1)
        } else {
            d.atPut(n, 1)
        }
        return this
    }

    
    nameForCount (n) {
        if (n === 1) { return "Single" }
        if (n === 2) { return "Double" }
        if (n === 3) { return "Triple"; }
        if (n === 4) { return "Quadruple"; }
        if (n === 5) { return "Quintuple"; }
        return "Many"
    }
    beginMessageForCount (n) {
        return "on" + this.nameForCount(n) + "TapBegin"
    }

    completeMessageForCount (n) {
        return "on" + this.nameForCount(n) + "TapComplete"
    }

    cancelledMessageForCount (n) {
        return "on" + this.nameForCount(n) + "TapCancelled"
    }
    */

}.initThisClass()
