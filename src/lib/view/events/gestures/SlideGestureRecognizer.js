"use strict"

/*
    SlideGestureRecognizer

    This gets tricky as we need to follow movement outside the view.
    To do this, we add special event move and up handlers to the document after getting
    a down event and then remove them after the up event. 
    
    We ignore the view's own move and up events.

    Delegate messages :

        onSlideGestureBegin
        onSlideGestureMove
        onSlideGestureComplete
        onSlideGestureCancelled
    
    Gesture state info methods:

        direction()
        distance() 
        downPosInView()

    TODO

        make multitouch

        optimization: floor the move event points and only send delegate messages if
        new position is different from last?

*/


window.SlideGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "SlideGestureRecognizer",
    isPressing: false,

    // new stuff
    direction: "left", 
    validDirectionsDict: { left: 1, right: 2, up: 3, down: 4 },
    numberOfTouchesRequired: 1,
    minDistToBegin: 10,

    downPositionInTarget: null,
    downPosition: null,
    currentPosition: null,
    upPosition: null,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        this.setListenerClasses(["MouseListener"])
        //this.setIsDebugging(true)
        //this.setListenerClasses(["MouseListener", "TouchListener"]) 
        return this
    },

    setDirection: function(directionName) {
        assert(directionName in this.validDirectionsDict());
        this._direction = directionName
        return this
    },

    setNumberOfTouchesRequired: function(n) {
        asset(n == 1) // need to add multi-touch support
        this._numberOfTouchesRequired = n
        return this
    },

    // --- events --------------------------------------------------------------------

    // tap events

    onPressDownPos: function (pos) {
        //console.log(this.type() + ".onPressDownPos(" + pos.asString() + ")")
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
                let r = vt.requestActiveGesture(this)
                if(r) {
                    this.setIsActive(true)
                    this.sendDelegateMessage("onSlideGestureBegin")
                }
            }
        
            if (this.isActive()) {
                this.sendDelegateMessage("onSlideGestureMove")
            }
        }
    },

    // -----------

    onPressUpPos: function (pos) {
        if (this.isPressing()) {
            this.setIsPressing(false)
            this.setCurrentPosition(pos)
            if (this.isActive()) {
                this.sendDelegateMessage("onSlideGestureComplete")
            }
            this.finish()
        }

        return true
    },

    cancel: function() {
        if (this.isActive()) {
            this.sendDelegateMessage("onSlideGestureCancelled")
        }
        this.finish()
        return this
    },

    finish: function() {
        //console.log(this.type() + ".finish()")
        this.setIsActive(false)
        this.stopDocListeners()
        return this
    },

    // ----------------------------------

    hasMovedEnough: function() {
        let dp = this.pressDiffPos()
        let m = this.minDistToBegin()

        let funcs = {
            left:  (dx, dy, m) => -dx > m,
            right: (dx, dy, m) =>  dx > m,
            up:    (dx, dy, m) =>  dy > m,
            down:  (dx, dy, m) => -dy > m
        }

        let r =  funcs[this.direction()](dp.x(), dp.y(), m)
        return r
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

    distance: function() {
        let dp = this.pressDiffPos()
        let dx = Math.abs(dp.x())
        let dy = Math.abs(dp.y())
        let funcs = {
            left:  (dx, dy) => dx,
            right: (dx, dy) => dx,
            up:    (dx, dy) => dy,
            down:  (dx, dy) => dy
        }
        return funcs[this.direction()](dx, dy)
    },
})
