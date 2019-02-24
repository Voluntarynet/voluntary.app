/*
    GestureRecognizer

    How will these work?
    DivView will have a list of gestureRecognizers. 
    If any of it's event methods get called, they'll send a copy of the event to any
    gestureRecognizers the view contains. 

    The gestureRecognizers will send a message like onPinchGesture:, onLongPressGesture:, etc 
    to the target.

    When the target is set, the GestureRecognizer will tell it to register for any events it needs.

*/

"use strict"

window.GestureRecognizer = ideal.Proto.extend().newSlots({
    type: "GestureRecognizer",
    
    target: null,
    state: null,

    eventsNeeded: null,   
    currentEvent: null, 

    isListeningForTouchEvents: false,
    isListeningForMouseEvents: false,
}).setSlots({
    init: function () {
        this.setEventsNeeded([])
        return this
    },

    setTarget: function(aTarget) {
        this._target = aTarget

        // register eventsNeeded on target?
        return this
    },

    // --- events --------------------------------------------------------------------


    registerForEvents: function() {

    },

    unregisterForEvents: function() {

    },

    // click events

    /*
    onClick: function(event) {
        this.sendActionToTarget()
        event.stopPropagation()
        return false
    },
    */
    
    // touch events

    touchDownDiffWithEvent: function(event) {
        assert(this._onTouchDownEventPosition) 

        let thisTouch = event.changedTouches[0]
        let lastTouch = this._onTouchDownEventPosition
        let d = {} 
        d.xd = thisTouch.screenX - lastTouch.screenX
        d.yd = thisTouch.screenY - lastTouch.screenY
        d.dist = Math.sqrt(d.xd*d.xd + d.yd*d.yd)
        return d
    },

    onTouchStart: function(event) {
        this._isTouchDown = true
        var touches = event.changedTouches
        //console.log(this.type() + " onTouchStart ", touches)
        this._onTouchDownEventPosition = { screenX: touches[0].screenX, screenY: touches[0].screenY }
        //console.log(this.type() + " onTouchStart  this._onTouchDownEventPosition ", this._onTouchDownEventPosition)
        this.didTouchStart()
    },

    didTouchStart: function() {
        // for subclasses to override
    },
	
    onTouchMove: function(event) {
        //console.log(this.type() + " onTouchMove diff ", JSON.stringify(this.touchDownDiffWithEvent(event)))
    },
	
    onTouchCancel: function(event) {
        //console.log(this.type() + " onTouchCancel")
        this._isTouchDown = false
    },
	
    onTouchEnd: function(event) {
        //console.log(this.type() + " onTouchEnd diff ", JSON.stringify(this.touchDownDiffWithEvent(event)))
        if (this._isTouchDown) {

	        this._isTouchDown = false
        }
    },	

    // mouse events
    
    onMouseMove: function (event) {
        return true
    },
    
    onMouseEnter: function(event) {
        return true
    },

    onMouseLeave: function(event) {
        return true
    },

    onMouseOut: function (event) {
        //console.log("onMouseOut")
        return true
    },
    
    onMouseOver: function (event) {
        return true
    },

    onMouseDown: function (event) {

    },

    onMouseUp: function (event) {
    },
        
    // --- keyboard events ---
    
    onKeyDown: function (event) {

        return true
    },
    
    onKeyPress: function (event) {
        // console.log("onKeyPress")
        return true
    },
    
    onKeyUp: function (event) {
   
        return true
    },

    /*
    onEnterKeyUp: function() {
        return true
    },
    
    // --- tabs and next key view ----
    
    onTabKeyDown: function() {
        this.selectNextKeyView()
        return true
    },

    selectNextKeyView: function() {
        console.log(this.type() + " selectNextKeyView")
        var nkv = this.nextKeyView()
        if (nkv) {
            //if (nkv.initialFirstResponder()) {
            //nkv.focus()
            //}
        }	
    },
    */
    
    
    // -- registering for events ----

    eventFuncForMethodName: function (methodName) {
        if (!this._listenerFuncs) {
            this._listenerFuncs = {}
        }

        if (!this._listenerFuncs[methodName]) {
            let f = (event) => { 
                let result = this[methodName].apply(this, [event]) 

                if (this.gestureRecognizers()) {
                    this.gestureRecognizers().forEach((gestureRecognizer) => {
                        var result = gestureRecognizer[methodName].apply(gestureRecognizer, [event])
                        // do we let the result effect event propogation on gestures?
                    })
                }

                if (result == false) {
                    event.stopPropagation()
                }
                return result
            }
            this._listenerFuncs[methodName] = f
            //this._listenerFuncs[methodName] = (event) => { this.handleEventFunction(f, event) }
        }
        return this._listenerFuncs[methodName]
    },
    
    listenForTouchEvents: function(aBool) {
        if (aBool) {
            if (this.isListeningForTouchEvents() == false) {
                this.setIsListeningForTouchEvents(true)
                //let b = Modernizr.passiveeventlisteners ? {passive: true} : false
                let b = { passive: true}
	        	this.element().addEventListener("touchstart",  this.eventFuncForMethodName("onTouchStart"), b);
	        	this.element().addEventListener("touchmove",   this.eventFuncForMethodName("onTouchMove"), b);
	        	this.element().addEventListener("touchcancel", this.eventFuncForMethodName("onTouchCancel"), b);
	        	this.element().addEventListener("touchend",    this.eventFuncForMethodName("onTouchEnd"), b);
            }
            this.setTouchAction("none") // testing
        } else {
            if (this.isListeningForTouchEvents() == true) {
                this.setIsListeningForTouchEvents(false)
	        	this.element().removeEventListener("touchstart",  this.eventFuncForMethodName("onTouchStart"));
	        	this.element().removeEventListener("touchmove",   this.eventFuncForMethodName("onTouchMove"));
	        	this.element().removeEventListener("touchcancel", this.eventFuncForMethodName("onTouchCancel"));
	        	this.element().removeEventListener("touchend",    this.eventFuncForMethodName("onTouchEnd"));
            }
        }
        return this
    },

})
