/*
    SlideGestureRecognizer

    This gets tricky as we need to follow movement outside the view.
    To do this, we add special event move and up handlers to the document after getting
    a down event and then remove them after the up event. 
    
    We ignore the view's own move and up events.
    
*/

"use strict"

window.SlideGestureRecognizer = GestureRecognizer.extend().newSlots({
    type: "SlideGestureRecognizer",
    isPressing: false,

    downPositionInTarget: null,
    downPosition: null,
    currentPosition: null,
    upPosition: null,
}).setSlots({
    
    init: function () {
        GestureRecognizer.init.apply(this)
        return this
    },

    // --- events --------------------------------------------------------------------

    // tap events

    onPressDownPos: function (pos) {
        this.setIsPressing(true)
        this.setDownPosition(pos)
        this.setCurrentPosition(pos)
        this.setDownPositionInTarget(this.target().windowPos())
        return true
    },

    onPressMovePos: function(pos) {
        if (this.isPressing()) {
            this.setCurrentPosition(pos)

            
        }
    },

    onPressUpPos: function (pos) {
        this.setIsPressing(false)
        this.setCurrentPosition(pos)
        this.setUpPosition(pos)
        return true
    },

    pressDiffPos: function() {
        return this.currentPosition().subtract(this.downPosition())
    },


    // mouse events

    onMouseDown: function (event) {
        GestureRecognizer.onMouseDown.apply(this, [event])
        let p = Point.clone().setToMouseEventWinPos(event)
        return this.onPressDownPos(p)
    },

    onMouseMove: function(event) {
        GestureRecognizer.onMouseMove.apply(this, [event])
        let p = Point.clone().setToMouseEventWinPos(event)
        this.onPressMovePos(p)
    },

    onMouseUp: function (event) {
        GestureRecognizer.onMouseUp.apply(this, [event])
        let p = Point.clone().setToMouseEventWinPos(event)
        return this.onPressUpPos(p)
    },

    
    // touch events

    onTouchStart: function(event) {
        GestureRecognizer.onTouchStart.apply(this, [event])
        //return this.onPressDown(event)
    },
    
    onTouchMove: function(event) {
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
        GestureRecognizer.onTouchCancel.apply(this, [event])
        return this.onPressUp(event)
    },
	
    onTouchEnd: function(event) {
        GestureRecognizer.onTouchEnd.apply(this, [event])
        return this.onPressUp(event)
    },	

})
