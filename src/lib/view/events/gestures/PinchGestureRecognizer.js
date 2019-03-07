"use strict"

/*

    PinchGestureRecognizer

    Delegate messages:

        onPinchBegin
        onPinchMove
        onPinchComplete
        onPinchCancelled

*/


window.PinchGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "PinchGestureRecognizer",
    isPressing: false,

    minFingersRequired: 2,
    maxFingersAllowed: 4,
    minDistToBegin: 10,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"]) 
        //this.setIsDebugging(true)
        return this
    },

    // events

    onDown: function (event) {
        if (!this.isPressing()) {
            this.setCurrentEvent(event)
            if (this.currentFingersDown() >= this.numberOfFingerRequired()) {
                this.setIsPressing(true)
                this.setBeginEvent(event)
                this.startDocListeners()
            }
        }
    },

    onMove: function(event) {
        if (this.isPressing()) {
            this.setCurrentEvent(event)

            if (this.hasMovedTooMuchPerpendicular()) {
                this.cancel()
                return this
            }

            if (!this.isActive() && this.hasMovedEnough()) {
                let vt = this.viewTarget()
                let r = vt.requestActiveGesture(this)
                if(r) {
                    this.setIsActive(true)
                    this.setBeginEvent(event)
                    this.sendDelegateMessage("onSlideBegin")
                }
            }
        
            if (this.isActive()) {
                this.sendDelegateMessage("onSlideMove")
            }
        }
    },

    // -----------

    onUp: function (event) {
        if (this.isPressing()) {
            this.setIsPressing(false)
            this.setCurrentEvent(event)
            if (this.isActive()) {
                this.sendDelegateMessage("onSlideComplete")
            }
            this.finish()
        }

        return true
    },

    cancel: function() {
        if (this.isActive()) {
            this.sendDelegateMessage("onSlideCancelled")
        }
        this.finish()
        return this
    },

    finish: function() {
        //console.log(this.typeId() + ".finish()")
        this.setIsPressing(false)
        this.setIsActive(false)
        this.stopDocListeners()
        this.didFinish()
        return this
    },

})
