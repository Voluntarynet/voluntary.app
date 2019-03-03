"use strict"

/*
    GestureRecognizer

    A DivView has a list of gestureRecognizers. 
    It forwards relevant events to it's recognizers. 
    These can initiate the recognizer to start listening to document.body events.

    Example:

        1. aView.onMouseDown -> forwarded to -> SlideGestureRecognizer
        1.a. starts capturing on document.body
        2. onMouseMoveCapture, if dx > min,  send:
            targetView.requestActiveGesture(thisGesture)
            if this returns true, set the gesture to isActive and
            send theView.recognizedSlideGesture(this) on moves
        3. onMouseUpCapture, if the gesture is active, 
            send theView.recognizedSlideGestureComplete(this)
        3.a. stop capturing on document.body

*/


window.GestureRecognizer = ideal.Proto.extend().newSlots({
    type: "GestureRecognizer",
    
    viewTarget: null,
    state: null,

    currentEvent: null, 

    listenerClasses: null,
    viewListeners: null, 
    docListeners: null, 
    isActive: false,

    isDebugging: false,

    shouldRemoveOnComplete: false,
    //isCancelled: false,
}).setSlots({
    init: function () {
        this.setListenerClasses([]) // subclasses override this in their
        this.setDocListeners([])
        this.setViewListeners([])
        return this
    },

    // --- listeners ---

    newListeners: function() {
        return this.listenerClasses().map((className) => {
            let proto = window[className];
            let listener = proto.clone();
            listener.setDelegate(this);
            return listener
        })
    },

    // --- view listeners ---

    stopViewListeners: function() {
        this.viewListeners().forEach((listener) => { listener.stop() })
        this.setViewListeners([])
        return this
    },

    startViewListeners: function() {
        this.stopViewListeners()

        let listeners = this.newListeners().map((listener) => {
            listener.setElement(this.viewTarget().element())
            listener.start()
            return listener
        })
        this.setViewListeners(listeners)
        return this
    },

    // --- doc listeners ---

    stopDocListeners: function() {
        this.docListeners().forEach((listener) => { listener.stop() })
        this.setDocListeners([])
        return this
    },

    startDocListeners: function() {
        this.stopDocListeners()

        let listeners = this.newListeners().map((listener) => {
            listener.setUseCapture(true)
            listener.setElement(document.body)
            //listener.setIsDebugging(true);
            listener.start()
            return listener
        })
        this.setDocListeners(listeners)
        return this
    },

    // --- start / stop ---

    start: function() {
        this.startViewListeners()
        //this.startDocListeners() // some view events will start and stop the doc listeners
        return this
    },

    stop: function() {
        this.stopViewListeners()
        this.stopDocListeners()
        return this
    },

    didFinish: function() {
        if (this.shouldRemoveOnComplete()) {
            this.stop()
            this.viewTarget().removeGestureRecognizer(this)
        }
        return this
    },

    // subclass helpers

    sendDelegateMessage: function(methodName) {
        if (this.isDebugging()) {
            console.log(this.type() + " sending " + methodName)
        }

        let vt = this.viewTarget()
        if (vt[methodName]) {
            vt[methodName].apply(vt, [this])
        } else {
            if (this.isDebugging()) {
                console.log("gesture delegate missing method " + methodName)
            }
        }
        return this
    },

    /*
    sendStateMessage: function(state) {
        let g = this.type().before("GestureRecognizer")
        let msg = "on" + this.type() + state
        this.sendDelegateMessage(msg)
        return this
    },

    sendBeginMessage: function() {
        this.sendStateMessage("Begin")
        //this.didBegin()
        return this
    },

    sendMoveMessage: function() {
        return this.sendStateMessage("Move")
    },

    sendCompleteMessage: function() {
        this.sendStateMessage("Complete")
        this.didFinish()
        return this
    },

    sendCancelledMessage: function() {
        this.sendStateMessage("Cancelled")
        this.didFinish()
        return this
    },
    */

    // points helper
    // maps mouse and touch events to a common list of points (with times and ids) format
    // so we can share the event handling code for both devices 

    pointsForEvent: function(event) {
        if (event.__proto__.constructor === MouseEvent) {
            let points = []
            let b = event.buttons
            if (b == 0) {
                points.append(Point.clone().setToMouseEventWinPos(event).setId("mouse"))
            } else if (b & 1) {
                points.append(Point.clone().setToMouseEventWinPos(event).setId("mouseWithButton1")) // primary button
            } else if (b & 2) {
                points.append(Point.clone().setToMouseEventWinPos(event).setId("mouseWithButton2"))
            } else if (b & 4) {
                points.append(Point.clone().setToMouseEventWinPos(event).setId("mouseWithButton3"))
            }
            return points
        } else if (event.__proto__.constructor === TouchEvent) {  // mouse event
            let points = []
            event.touches.forEach((touch) => {
                points.append(Point.clone().set(touch.screenX, touch.screenY).setId(touch.identifier).setTarget(touch.target))
            })
            return points
        }
        new Error("can't handle this event type yet: ", event)
    },
})

//this.setTouchAction("none") // testing
