"use strict"

/*

    PanGestureRecognizer

    Gesture begins when the minimal number of fingers have moved the minimal distance.
    Will requestActive before beginning.

    Delegate messages:

        onPanBegin
        onPanMove
        onPanComplete
        onPanCancelled

*/

window.PanGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "PanGestureRecognizer",
    isPressing: false,
    minNumberOfFingersRequired: 1,
    maxNumberOfFingersAllowed: 1,
    minDistToBegin: 10,
    //downPositionInTarget: null,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener", "TouchListener"]) 
        //this.setIsDebugging(false)
        return this
    },

    // --- events --------------------------------------------------------------------

    // tap events

    hasOkFingerCount: function() {
        const n = this.numberOfFingersDown()
        const min = this.minNumberOfFingersRequired()
        const max = this.maxNumberOfFingersAllowed()
        return (n >= min && n <= max)
    },

    isReadyToBegin: function() {
        return this.hasOkFingerCount();
    },


    onDown: function (event) {
        GestureRecognizer.onDown.apply(this, [event])

        if (!this.isPressing()) {
            if (this.isReadyToBegin()) {
                this.setIsPressing(true)
                this.setDownEvent(event)
                this.startDocListeners()
            }
        }
        
        return this
    },

    attemptBegin: function() {
        if(this.requestActivation()) {
            this.sendBeginMessage() // begin
        } else {
            console.log(this.shortTypeId() + ".attemptBegin() FAILED")
        }
    },

    onMove: function(event) {
        GestureRecognizer.onMove.apply(this, [event])

        if (this.isPressing()) {
            if (!this.isActive() && this.hasMovedEnough()) {
                this.attemptBegin()
            }
        
            if (this.isActive()) {
                this.sendMoveMessage() // move
            }
        }
        return this
    },

    onUp: function (event) {
        GestureRecognizer.onUp.apply(this, [event])

        if (this.isPressing()) {
            if (this.isActive()) {
                this.sendCompleteMessage() // complete
            }
            this.didFinish() // will set isPressing to false
        }
        return this
    },

    // ----------------------------------

    cancel: function() {
        if (this.isActive()) {
            this.sendCancelledMessage()
        }
        this.didFinish()
        return this
    },

    didFinish: function() {
        GestureRecognizer.didFinish.apply(this)
        this.setIsPressing(false)
        this.stopDocListeners()
        return this
    },

    // ----------------------------------

    hasMovedEnough: function() {
        const m = this.minDistToBegin()
        const d = this.currentPosition().distanceFrom(this.downPosition())
        return d >= m
    },

    distance: function() {
        return this.currentPosition().distanceFrom(this.beginPosition())
    },

})
