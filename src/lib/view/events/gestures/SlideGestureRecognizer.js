"use strict"

/*
    SlideGestureRecognizer

    This gets tricky as we need to follow movement outside the view.
    To do this, we add special event move and up handlers to the document after getting
    a down event and then remove them after the up event. 
    
    We ignore the view's own move and up events.
    
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
        //console.log(this.type() + ".onPressDownPos(" + pos.asString() + ")")

        this.setIsPressing(true)
        this.setDownPosition(pos)
        this.setCurrentPosition(pos)
        this.setDownPositionInTarget(this.viewTarget().windowPos())

        this.startDocListeners()
        return true
    },

    onPressMovePos: function(pos) {
        //console.log(this.type() + ".onPressMovePos(" + pos.asString() + ")")
        if (this.isPressing()) {
            this.setCurrentPosition(pos)
            let dp = this.pressDiffPos()

            if (!this.isActive()) {
                if(this.isHorizontal()) {
                    if (Math.abs(dp.x()) > this.minDist()) {
                        this.didMoveEnough()
                        //console.log("dx: ", dp.x())
                    }
                } else {
                    if (Math.abs(dp.y()) > this.minDist()) {
                        this.didMoveEnough()
                        //console.log("dy: ", dp.y())
                    }
                }
            }

            if (this.isActive()) {
                let v = this.viewTarget()
                if (v.onSlideGesture) {
                    v.onSlideGesture.apply(v, [this])
                }
                console.log("onSlideGesture ", dp.toString())
            }
        }
    },

    didMoveEnough: function() {
        this.viewTarget().requestActiveGesture()
        this.setIsActive(true)
    },

    onPressUpPos: function (pos) {
        this.setIsPressing(false)
        this.setCurrentPosition(pos)
        this.setUpPosition(pos)
        
    
        if (this.isActive()) {
            let v = this.viewTarget()
            if (v.onSlideGestureComplete) {
                v.onSlideGestureComplete.apply(v, [this])
            }
            console.log("onSlideGestureComplete ")
        }

        this.stopDocListeners()
        this.setIsActive(false)
        return true
    },

    cancel: function() {
        this.setActive(false)
        return this
    },

    // -----------

    pressDiffPos: function() {
        return this.currentPosition().subtract(this.downPosition())
    },

    // mouse events

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

    
    // touch events

    onTouchStart: function(event) {
        //return this.onPressDown(event)
    },
    
    onTouchMoveCapture: function(event) {
        /*
        console.log(this.type() + " onTouchMove diff ", JSON.stringify(this.touchDownDiffWithEvent(event)))
        if (this.canDelete()) {
            this._touchMoveDiff = this.touchDownDiffWithEvent(event)
            //console.log("onTouchMove:" + JSON.stringify(diff))
            var xd = Math.floor(this._touchMoveDiff.xd)
            
            if (xd > 0) { 
                xd = 0; 
            }

            if (this._lastXd != xd) {
                this.setTouchLeft(xd)
                this._lastXd = xd

                this._isReadyToTouchDelete  = -xd >= this._touchDeleteOffset

                if (this._dragDeleteView) {
                    this._dragDeleteButtonView.setOpacity(this._isReadyToTouchDelete? 1 : 0.2)
                }
            }
        }
        */
    },

	
    onTouchCancel: function(event) {
        return this.onPressUp(event)
    },
	
    onTouchEnd: function(event) {
        return this.onPressUp(event)
    },	

})
