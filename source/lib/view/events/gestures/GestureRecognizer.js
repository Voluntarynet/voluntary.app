"use strict"

/*
    GestureRecognizer

    A DomView has a list of gestureRecognizers. 
    It forwards relevant events to it's recognizers. 
    These can initiate the recognizer to start listening to document.body events.

    Example:

        1. aView.onMouseDown -> forwarded to -> SlideGestureRecognizer
        1.a. starts capturing on document.body
        2. onMouseMoveCapture, if dx > min,  send:
            this.requestActiveGesture()
            if this returns true, set the gesture to isActive and
            send theView.recognizedSlideGesture(this) on moves
        3. onMouseUpCapture, if the gesture is active, 
            send theView.recognizedSlideGestureComplete(this)
        3.a. stop capturing on document.body


    Marked event semantics:

        downEvent - set onDownEvent *if* number of touchs is in correct range
        beginEvent - set when sending begin message - typically in onMove: 
        activePoints() - returns downEvent points for fingers contained in currentEvent
        upEvent - usually set on complete, not used much yet

    TODO:

        - move visualizer to separate class?
*/


window.GestureRecognizer = ideal.Proto.extend().newSlots({
    type: "GestureRecognizer",
    
    viewTarget: null,
    shouldRemoveOnComplete: false,

    // listeners

    listenerClasses: null,
    viewListeners: null, 
    docListeners: null, 
    //isActive: false,
    defaultListenerClasses: ["MouseListener", "TouchListener"],

    // events

    overEvent: null,
    leaveEvent: null,

    didBegin: false,
    downEvent: null,
    beginEvent: null,
    currentEvent: null,
    lastEvent: null,
    upEvent: null,

    // standard messages

    acceptMessage: null,    //"accepts<GestureType>Begin"
    beginMessage: null,     //"on<GestureType>Begin",
    moveMessage: null,      //"on<GestureType>Move",
    cancelledMessage: null, // "on<GestureType>Cancelled",
    completeMessage: null,  // "on<GestureType>Complete",

    // debugging

    isEmulatingTouch: false, // assumes touch and mouse events aren't mixed

    isDebugging: false,
    isVisualDebugging: false,
    fingerViewDict: null,

    // begin pressing 

    isPressing: false,

    minFingersRequired: 2,
    maxFingersAllowed: 4,
    minDistToBegin: 10,
    //maxDistToBegin: null,
    allowsKeyboardKeys: false,
    requiresKeyboardKeys: null, 
}).setSlots({
    init: function () {
        this.setListenerClasses([]) // subclasses override this in their
        this.setDocListeners([])
        this.setViewListeners([])
        this.autoSetMessageNames()
        this.setIsEmulatingTouch(true)
        this.setFingerViewDict({})
        //this.setIsDebugging(true)
        //this.setIsVisualDebugging(true)
        return this
    },

    // -- event helpers --

    clearEvents: function() {
        this.setDownEvent(null)
        this.setBeginEvent(null)
        this.setCurrentEvent(null)
        return this
    },
    
    setCurrentEvent: function(event) {
        if (this._currentEvent !== event) {
            this.setLastEvent(this._currentEvent)
            this._currentEvent = event
        }
        return this
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
        const points = this.pointsForEvent(this.currentEvent())
        return points.length
    },

    currentEventIsOnTargetView: function() {
        const points = this.pointsForEvent(this.currentEvent())
        const p = points.first()
        const view = this.viewTarget()
        return view.containsPoint(p)
        //return points.detect(p1 => !view.containsPoint(p1)) === null
    },

    // --- listeners ---

    newListeners: function() {
        return this.listenerClasses().map((className) => {
            const proto = window[className];
            const listener = proto.clone();
            listener.setDelegate(this);
            return listener
        })
    },

    // --- view listeners ---

    stopViewListeners: function() {
        this.viewListeners().forEach(listener => listener.stop())
        this.setViewListeners([])
        return this
    },

    startViewListeners: function() {
        this.stopViewListeners()

        const listeners = this.newListeners().map((listener) => {
            listener.setListenTarget(this.viewTarget().element())
            listener.start()
            return listener
        })
        this.setViewListeners(listeners)
        return this
    },

    // --- doc listeners ---

    stopDocListeners: function() {
        this.docListeners().forEach(listener => listener.stop())
        this.setDocListeners([])
        return this
    },

    startDocListeners: function() {
        this.stopDocListeners()

        const listeners = this.newListeners().map((listener) => {
            listener.setUseCapture(true)
            listener.setListenTarget(document.body)
            //listener.setIsDebugging(true);
            listener.start()
            return listener
        })
        this.setDocListeners(listeners)
        return this
    },

    // condition helpers

    hasMovedEnough: function() {
        // intended to be overridden by subclasses
        // e.g. a rotation recognizer might look at how much first two fingers have rotated
        const m = this.minDistToBegin()
        const d = this.currentPosition().distanceFrom(this.downPosition())
        return d >= m
    },

    hasAcceptableFingerCount: function() {
        const n = this.numberOfFingersDown()
        return  n >= this.minFingersRequired() &&
                n <= this.maxFingersAllowed();
    },

    hasAcceptableKeyboardState: function() {
        if (!this.allowsKeyboardKeys()) {
            if (!Keyboard.shared().hasKeysDown()) {

                // make exception for shift key since we use it to emulate multi-touch
                if (keyboard.currentlyDownKeys().length === 1) {
                    if(keyboard.shiftIsDown()) {
                        return true
                    }
                }
                return false
            }
        }
        return true
    },

    canBegin: function() {
        return !this.isActive() && 
                this.hasMovedEnough() && 
                this.hasAcceptableFingerCount() &&
                this.hasAcceptableKeyboardState();
    },

    // --- start / stop ---

    start: function() {
        this.startViewListeners()
        // We typically don't want to listen to document level events all the time.
        // Instead, some view events will start and stop the doc listeners.
        //this.startDocListeners() 
        return this
    },

    stop: function() {
        this.stopViewListeners()
        this.stopDocListeners()
        return this
    },

    // active

    requestActivation: function() {
        return GestureManager.shared().requestActiveGesture(this);
    },

    isActive: function() {
        return GestureManager.shared().activeGesture() === this
    },

    deactivate: function() {
        GestureManager.shared().deactivateGesture(this);
        return this
    },

    // finish

    didFinish: function() {
        this.setDidBegin(false)
        GestureManager.shared().removeBegunGesture(this)

        setTimeout(() => { 
            GestureManager.shared().removeBegunGesture(this)
            this.deactivate();
        }, 0)

        if (this.shouldRemoveOnComplete() && this.viewTarget()) {
            this.stop()
            this.viewTarget().removeGestureRecognizer(this)
        }

        this.removeFingerViews()
        return this
    },

    // subclass helpers

    sendDelegateMessage: function(methodName) {
        let result = null
        assert(methodName !== null)
        const vt = this.viewTarget()

        if (this.isDebugging()) {
            console.log(this.shortTypeId() + " sending " + methodName + " to " + vt.typeId())
        }
        try {
            if (vt[methodName]) {
                result = vt[methodName].apply(vt, [this])
            } else {
                if (this.isDebugging()) {
                    console.log("gesture delegate missing method " + methodName)
                }
                result = false
            }
        } catch(e) {
            console.warn(this.typeId() + ".sendDelegateMessage(" + methodName + ") caught exception ", e)
            result = false
        }

        return result
    },

    // points helper
    // maps mouse and touch events to a common list of points (with times and ids) format
    // so we can share the event handling code for both devices 

    pointsForEvent: function(event) {
        if (event == null) {
            throw new Error(this.type() + ".pointsForEvent(event) event is null")
        }

        const eventClass = event.__proto__.constructor;

        if (eventClass === MouseEvent) {
            //console.log(this.typeId() + " got mouse")
            return Mouse.shared().pointsForEvent(event)
        } else if (eventClass === TouchEvent) {   
            //console.log(this.typeId() + " got touch")
            return TouchScreen.shared().pointsForEvent(event)
        }
        
        console.warn(this.type() + " can't handle this event type yet: ", event)

        return []
    },

    // all events hook

    onEvent: function(event) {
        if (this.isVisualDebugging()) {
            this.updateOutlineView()
            this.updateFingerViews()
            //this.updateDebugTimer()
        }
    },

    // --- events ---

    onOver: function(event) {
        this.setOverEvent(event)
        this.setCurrentEvent(event)
        this.onEvent(event)
    },

    onDown: function (event) {
        this.setDownEvent(event)
        this.setCurrentEvent(event)
        this.onEvent(event)
    },

    onMove: function(event) {
        this.setCurrentEvent(event)
        this.onEvent(event)
    },

    onUp: function (event) {
        this.setUpEvent(event)
        //this.setCurrentEvent(event) // on Windows, the up event may not have any positions
        this.onEvent(event)
    },

    onLeave: function(event) {
        this.setLeaveEvent(event)
        this.setCurrentEvent(event)
        this.onEvent(event)
    },

    // --- mouse events ---

    shouldEmulateEvent: function(event) {
        return this.isEmulatingTouch() && 
                event.shiftKey && 
                event.__proto__.constructor === MouseEvent &&
                this.pointsForEvent(event).length === 1;
    },

    emulateDownIfNeeded: function(event) {
        const p1 = this.pointsForEvent(event).first()

        if (this.shouldEmulateEvent(event)) {
            // make a duplicate of the down event point with a different id
            const p2 = p1.copy().setId("emulatedTouch")
            p2.setX(p2.x() + 10)
            p2.setY(p2.y() + 10)
            Event_pushCachedPoint(event, p2)
        }
        return this
    },

    onMouseDown: function (event) {        
        this.emulateDownIfNeeded(event)
        this.setDownEvent(event)
        this.onDown(event)
    },

    emulateMoveIfNeeded: function(event) {
        const p2 = this.pointsForEvent(event).first()

        if (this.shouldEmulateEvent(event) && this.downEvent()) {      
            // get down point and current point and add an emulated point on the other side
            const p1 = this.pointsForEvent(this.downEvent()).first()
            const v = p2.subtract(p1).negated()
            const emulatedPoint = p1.add(v).setId("emulatedTouch")
            Event_pushCachedPoint(event, emulatedPoint)
        }

        return this
    },

    onMouseMove: function (event) {
        this.emulateMoveIfNeeded(event)
        this.onMove(event)
    },

    onMouseUp: function (event) {
        this.onUp(event)
    },

    onMouseLeave: function (event) {
        this.onLeave(event)
    },

    // mouse capture events

    onMouseOverCapture: function (event) {
        this.onOver(event)
    },

    onMouseDownCapture: function (event) {
        this.emulateDownIfNeeded(event)
        this.onDown(event)
    },

    onMouseMoveCapture: function (event) {
        this.emulateMoveIfNeeded(event)
        this.onMove(event)
    },

    onMouseUpCapture: function (event) {
        this.onUp(event)
    },

    onMouseLeaveCapture: function (event) {
        this.onLeave(event)
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

    onTouchCancel: function(event) {
        //this.onUp(event)
        this.cancel()
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

    onTouchCancelCapture: function(event) {
        //this.onUp(event)
        this.cancel()
    },

    // diff position helper

    diffPos: function() {
        return this.currentPosition().subtract(this.beginPosition()).floorInPlace() // floor here?
    },

    distance: function() {
        const dp = this.diffPos()
        const dx = Math.abs(dp.x())
        const dy = Math.abs(dp.y())
        const funcs = {
            left:  (dx, dy) => dx,
            right: (dx, dy) => dx,
            up:    (dx, dy) => dy,
            down:  (dx, dy) => dy,
            x:     (dx, dy) => dx,
            y:     (dx, dy) => dy
        }
        return funcs[this.direction()](dx, dy)
    },

    gestureName: function() {
        return this.type().before("GestureRecognizer")
    },

    defaultMessageForState: function(state) {
        return "on" + this.gestureName() + state.capitalized()
    },

    defaultAcceptMessage: function() {
        return "accepts" + this.gestureName()
    },

    autoSetMessageNames: function() {
        this.setAcceptMessage(this.defaultAcceptMessage())
        this.setBeginMessage(this.defaultMessageForState("Begin"))
        this.setMoveMessage(this.defaultMessageForState("Move"))
        this.setCancelledMessage(this.defaultMessageForState("Cancelled"))
        this.setCompleteMessage(this.defaultMessageForState("Complete"))
        return this
    },

    // sending delegate messages

    sendBeginMessage: function() {

        // see if view accepts the gesture before we begin
        // for now, assume it accepts if it doesn't implement the accept<GestureType> method
        const vt = this.viewTarget()
        if (vt[this.acceptMessage()]) {
            if (!this.sendDelegateMessage(this.acceptMessage())) {
                this.cancel()
                return false
            }
        }

        this.setDidBegin(true)
        this.setBeginEvent(this.currentEvent())
        this.sendDelegateMessage(this.beginMessage())
        GestureManager.shared().addBegunGesture(this)
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

    // ---

    cleanup: function() {
        this.setDownEvent(null)
        this.setCurrentEvent(null)
        this.setUpEvent(null)
        return this
    },

    shouldShowVisualDebugger: function() {
        return this.hasDownPointsInView() || this.isActive() // || this.isPressing());
    },

    // ---  outline view for debugging ---

    newOutlineView: function() {
        const v = DomView.clone()
        v.setPointerEvents("none")
        v.setBorder("1px dashed white")
        v.setBackgroundColor("transparent")
        v.setPosition("absolute")
        v.setZIndex(10000)
        return v
    },

    outlineView: function() {
        if (!this._outlineView) {
            const v = this.newOutlineView()
            this._outlineView = v
        }
        return this._outlineView
    },

    updateOutlineView: function() {
        /*
        if (this.shouldShowVisualDebugger()) {
            this.showOutlineView()
        } else {
            const v = this.outlineView()
            if (v.parentView()) {
                v.removeFromParentView()
            }
        }
        */
    },

    showOutlineView: function() {
        const v = this.outlineView()
        if (!v.parentView()) {
            DocumentBody.shared().addSubview(v)
        }
        const vt = this.viewTarget()
        const bounds = vt.frameInDocument()

        v.setMinAndMaxHeight(bounds.height())
        v.setMinAndMaxWidth(bounds.width())
        v.setLeft(bounds.x())
        v.setTop(bounds.y())
    },



    // --- finger views for debugging ---

    newFingerView: function() {
        const v = DomView.clone()
        v.setPointerEvents("none")

        const size = 50
        v.setMinAndMaxHeight(size)
        v.setMinAndMaxWidth(size)
        v.setBorderRadius(size/2)
        v.setBorder("1px dashed white")
        //v.setBackgroundColor("rgba(255, 255, 255, 0.5)")
        v.setPosition("absolute")
        v.setTextAlign("center")
        v.setZIndex(10000)
        v.setInnerHTML(this.type())
        v.setFontSize(10)
        v.setColor("white")
        return v
    },

    viewForFingerId: function(id) {
        const fvs = this.fingerViewDict()
        let v = fvs[id]
        if (!v) {
            v = this.newFingerView()
            DocumentBody.shared().addSubview(v)
            fvs[id] = v
        }
        return v
    },

    removeFingerViews: function() {
        const dict = this.fingerViewDict()
        Reflect.ownKeys(dict).forEach((id) => {
            const fingerView = dict[id]
            fingerView.removeFromParentView()
        })
        this.setFingerViewDict({})
        return this
    },

    titleForFingerNumber: function(n) {
        return "&nbsp;".repeat(26) + this.type() + "&nbsp;" + n + "&nbsp;of&nbsp;" + this.numberOfFingersDown() 
    },

    showFingers: function() {
        const points = this.pointsForEvent(this.currentEvent());
        const idsToRemove = Object.getOwnPropertyNames(this.fingerViewDict()) // TODO: move to dict
        let count = 1

        points.forEach((point) => {
            const id = point.id()
            const v = this.viewForFingerId(id);
            idsToRemove.remove(id) 
            const nx = point.x() - v.clientWidth()/2;
            const ny = point.y() - v.clientHeight()/2;
            v.setLeft(nx);
            v.setTop(ny);
            v.setInnerHTML(this.titleForFingerNumber(count))
            v.setBorder("1px dashed white")
            if(this.isPressing()) {
                v.setBorder("1px solid white")
                v.setColor("white")
            } else {
                v.setBorder("1px dashed #888")
                v.setColor("#888")
            }
            count ++
        })

        const fvd = this.fingerViewDict()
        idsToRemove.forEach((id) => {
            const fingerView = fvd[id]
            assert(fingerView)
            fingerView.removeFromParentView()
            delete fvd[id]
        })

        return this
    },

    updateFingerViews: function() {
        if (this.shouldShowVisualDebugger()) {
            this.showFingers()
        } else {            
            this.removeFingerViews()
        }

        return this
    },

    updateDebugger: function() {
        this.updateOutlineView() 
        this.updateFingerViews()
        if (this.viewTarget()) {
            console.log(this.viewTarget().typeId() + ".updateDebugger")
        }
    },

    updateDebugTimer: function() {
        if (this._debugTimerId) {
            clearTimeout(this._debugTimerId) 
            this._debugTimerId = null
        }

        this._debugTimerId = setTimeout(() => { 
            this._debugTimerId = null
            this.updateDebugger() 
        }, 100);

        return this
    },

    // down points

    hasDownPointsInView: function() {
        if (!this.viewTarget()) {
            return false
        }

        const view = this.viewTarget();
        const points = this.allDownPoints();
        const match = points.detect(p => view.containsPoint(p)) 
        //console.log("all points.length:", points.length, " has match:", match != null)
        return match !== null
    },

    allPoints: function() { // TODO: some better abstraction for Touch+Mouse?
        const points = []
        points.appendItems(TouchScreen.shared().currentPoints())
        points.appendItems(Mouse.shared().currentPoints())
        return points
    },

    allDownPoints: function() { // TODO: some better abstraction for Touch+Mouse?
        const points = this.allPoints().select(p => p.isDown())
        return points
    },

    shortTypeId: function() {
        return this.typeId().replaceAll("GestureRecognizer", "")
    },

    description: function() {
        return this.shortTypeId() + " on " + (this.viewTarget() ? this.viewTarget().typeId() : "null view target")
    },
})

//this.setTouchAction("none") // testing
