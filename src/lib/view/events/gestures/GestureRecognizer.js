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
    //state: null,

    listenerClasses: null,
    viewListeners: null, 
    docListeners: null, 
    isActive: false,

    isDebugging: false,

    shouldRemoveOnComplete: false,

    didBegin: false,
    downEvent: null,
    beginEvent: null,
    currentEvent: null,
    lastEvent: null,
    upEvent: null,

    beginMessage: null,     //"on<GestureName>Begin",
    moveMessage: null,      //"on<GestureName>Move",
    cancelledMessage: null, // "on<GestureName>Cancelled",
    completeMessage: null,  // "on<GestureName>Complete",
}).setSlots({
    init: function () {
        this.setListenerClasses([]) // subclasses override this in their
        this.setDocListeners([])
        this.setViewListeners([])
        this.autoSetMessageNames()
        return this
    },

    // -- event helpers --

    clearEvents: function() {
        this.setDownEvent(null)
        this.setBeginEvent(null)
        this.setCurrentEvent(null)
        return this
    },

    /*
    setDownEvent: function(event) {
        this._downEvent = event
        //this.setDownPositionInTarget(this.viewTarget().windowPos())
        return this
    },
    */

    setCurrentEvent: function(event) {
        if (this._currentEvent) {
            this.setLastEvent(this._currentEvent)
        } else {
            this.setLastEvent(event)
        }
        this._currentEvent = event
    },

    currentPosition: function() {
        return this.pointsForEvent(this.currentEvent()).first()
    },

    downPosition: function() {
        return this.pointsForEvent(this.downEvent()).first()
    },

    beginPosition: function() {
        return this.pointsForEvent(this.beginEvent()).first()
    },

    upPosition: function() {
        return this.pointsForEvent(this.upEvent()).first()
    },

    numberOfFingersDown: function() {
        let points = this.pointsForEvent(this.currentEvent())
        return points.length
    },

    currentEventIsOnTargetView: function() {
        let points = this.pointsForEvent(this.currentEvent())
        let p = points.first()
        let bounds = this.viewTarget().winBounds()
        return bounds.containsPoint(p)
    },

    /*
    currentViewTarget: function() {
        return this.currentEvent().target._divView
    },
    */


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
        this.setDidBegin(false)
        this.setIsActive(false)

        if (this.shouldRemoveOnComplete() && this.viewTarget()) {
            //let vt = this.viewTarget()
            //console.log(this.typeId() + ".shouldRemoveOnComplete() this.viewTarget() = " + (vt ? vt.typeId() : "null"))
            this.stop()
            this.viewTarget().removeGestureRecognizer(this)
        }
        return this
    },

    // subclass helpers

    sendDelegateMessage: function(methodName) {
        assert(methodName != null)

        if (this.isDebugging()) {
            console.log(this.typeId() + " sending " + methodName)
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

    // points helper
    // maps mouse and touch events to a common list of points (with times and ids) format
    // so we can share the event handling code for both devices 

    pointsForEvent: function(event) {
        if (event == null) {
            throw new Error(this.type() + ".pointsForEvent() event == null")
        }

        if (event._gestureRecognizerPoints) {
            return event._gestureRecognizerPoints
        }

        let points = []

        if (event.__proto__.constructor === MouseEvent) {
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
        } else if (event.__proto__.constructor === TouchEvent) {  // mouse event
            event.touches.forEach((touch) => {
                points.append(Point.clone().set(touch.screenX, touch.screenY).setId(touch.identifier).setTarget(touch.target))
            })
        } else {
            console.warn(this.type() + " can't handle this event type yet: ", event)
        }

        event._gestureRecognizerPoints = points
        return points
    },


    // --- events --------------------------------------------------------------------

    onDown: function (event) {
        this.setCurrentEvent(event)
    },

    onMove: function(event) {
        this.setCurrentEvent(event)
    },

    onUp: function (event) {
        this.setCurrentEvent(event)
    },

    // mouse events

    onMouseDown: function (event) {
        this.onDown(event)
    },

    onMouseMove: function (event) {
        this.onMove(event)
    },

    onMouseUp: function (event) {
        this.onUp(event)
    },

    // mouse capture events

    onMouseDownCapture: function (event) {
        this.onDown(event)
    },

    onMouseMoveCapture: function (event) {
        this.onMove(event)
    },

    onMouseUpCapture: function (event) {
        this.onUp(event)
    },

    // touch events

    onTouchStart: function(event) {
        this.onDown(event)
    },

    onTouchMove: function (event) {
        this.onMove(event)
    },

    onTouchEnd: function(event) {
        this.onUp(event)
    },
    
    // touch capture events

    onTouchStartCapture: function(event) {
        this.onDown(event)
    },

    onTouchMoveCapture: function (event) {
        this.onMove(event)
    },

    onTouchEndCapture: function(event) {
        this.onUp(event)
    },

    // diff position helper

    diffPos: function() {
        return this.currentPosition().subtract(this.beginPosition()).floorInPlace() // floor here?
    },

    distance: function() {
        let dp = this.diffPos()
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

    defaultMessageForState: function(state) {
        let name = this.type().before("GestureRecognizer")
        let msg = "on" + name + state.capitalized()
        return msg
    },

    autoSetMessageNames: function() {
        this.setBeginMessage(this.defaultMessageForState("Begin"))
        this.setMoveMessage(this.defaultMessageForState("Move"))
        this.setCancelledMessage(this.defaultMessageForState("Cancelled"))
        this.setCompleteMessage(this.defaultMessageForState("Complete"))
        return this
    },


    sendBeginMessage: function() {
        this.setDidBegin(true)
        this.setBeginEvent(this.currentEvent())
        this.sendDelegateMessage(this.beginMessage())
        return this
    },

    sendMoveMessage: function() {
        this.sendDelegateMessage(this.moveMessage())
        //this.didMove()
        return this
    },

    sendCompleteMessage: function() {
        this.sendDelegateMessage(this.completeMessage())
        this.didFinish()
        return this
    },

    sendCancelledMessage: function() {
        this.sendDelegateMessage(this.cancelledMessage())
        this.didFinish()
        return this
    },
})

//this.setTouchAction("none") // testing
