"use strict"

/*
    SlideGestureRecognizer

    This gets tricky as we need to follow movement outside the view.
    To do this, we add special event move and up handlers to the document after getting
    a down event and then remove them after the up event. 
    
    We ignore the view's own move and up events.

    Delegate messages :

        onSlideGestureBegin(slideGestureRecognizer)
        onSlideGestureMove(slideGestureRecognizer)
        onSlideGestureComplete(slideGestureRecognizer)
        
        //onSlideGestureCancel(slideGestureRecognizer)
    
    Gesture state info methods:

        isHorizontal()
        dx()
        dy()
        downPosInView()

*/


window.SlideGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "SlideGestureRecognizer",
    isPressing: false,

    downPositionInTarget: null,
    downPosition: null,
    currentPosition: null,
    upPosition: null,
    isHorizontal: true,
    minDist: 10,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener"])
        //this.setListenerClasses(["MouseListener", "TouchListener"]) 
        return this
    },

    // --- events --------------------------------------------------------------------

    // tap events

    onPressDownPos: function (pos) {
        console.log(this.type() + ".onPressDownPos(" + pos.asString() + ")")
        this.setIsPressing(true)
        this.setDownPosition(pos)
        this.setCurrentPosition(pos)
        this.setDownPositionInTarget(this.viewTarget().windowPos())

        this.startDocListeners()
        return true
    },

    onPressMovePos: function(pos) {
        if (this.isPressing()) {
            this.setCurrentPosition(pos)

            if (!this.isActive() && this.hasMovedEnough()) {
                let vt = this.viewTarget()
                console.log(this.type() + " requestActiveGesture ")

                if(vt.requestActiveGesture()) {
                    this.setIsActive(true)
                    this.sendDelegateMessage("onSlideGestureBegin")
                }
            }
        }

        if (this.isActive()) {
            this.sendDelegateMessage("onSlideGestureMove")
        }
    },

    // -----------

    onPressUpPos: function (pos) {
        if (this.isPressing()) {
            this.setIsPressing(false)
            this.setCurrentPosition(pos)
            this.setUpPosition(pos)
            this.stopDocListeners()
            this.setIsActive(false)

            if (this.isActive()) {
                this.sendDelegateMessage("onSlideGestureComplete")
            }
        }

        return true
    },

    cancel: function() {
        this.setActive(false)
        return this
    },

    // ----------------------------------

    hasMovedEnough: function() {
        let dp = this.pressDiffPos()
        if(this.isHorizontal()) {
            if (Math.abs(dp.x()) > this.minDist()) {
                return true
            }
        } else {
            if (Math.abs(dp.y()) > this.minDist()) {
                return true
            }
        }
        return false
    },

    // ------------------------------

    pressDiffPos: function() {
        return this.currentPosition().subtract(this.downPosition()).floorInPlace() // floor here?
    },

    // --- mouse events ---

    onMouseDown: function (event) {
        let p = Point.clone().setToMouseEventWinPos(event)
        return this.onPressDownPos(p)
    },

    onMouseMoveCapture: function(event) {
        let p = Point.clone().setToMouseEventWinPos(event)
        this.onPressMovePos(p)
    },

    onMouseUpCapture: function (event) {
        let p = Point.clone().setToMouseEventWinPos(event)
        return this.onPressUpPos(p)
    },

    // --- touch events ---

    onTouchStart: function(event) {
        let aTouch = event.changedTouches.item(0)
        let p = Point.clone().set(aTouch.screenX, aTouch.screenX)
        return this.onPressDownPos(p)
    },

    onTouchMoveCapture: function(event) {
        let aTouch = event.changedTouches.item(0)
        let p = Point.clone().set(aTouch.screenX, aTouch.screenX)
        return this.onPressMovePos(p)
    },

    onTouchCancelCapture: function(event) {
        let aTouch = event.changedTouches.item(0)
        let p = Point.clone().set(aTouch.screenX, aTouch.screenX)
        return this.onPressUpPos(p)
    },
	
    onTouchEndCapture: function(event) {
        let aTouch = event.changedTouches.item(0)
        let p = Point.clone().set(aTouch.screenX, aTouch.screenX)
        return this.onPressUpPos(p)
    },	

    // --- helpers ----

    dx: function() {
        let dp = this.pressDiffPos()
        return dp.x()
    },

    dy: function() {
        let dp = this.pressDiffPos()
        return dp.y()
    },
})
