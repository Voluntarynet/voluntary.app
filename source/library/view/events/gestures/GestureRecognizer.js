"use strict"

/*
    GestureRecognizer

    Listens for events and uses logic to detect gestures, 
    coordinate which gestures are active with a GestureManager,
    and send delegate messages for gesture state changes. This class supports general
    gesture logic & helper methods, and is intended to be sublclassed to implement
    particular gesture types. See SlideGestureRecognizer, for an example subclass.

    Event Listeners

    Listeners are typically on a particular view's element. document.body listeners
    are usually added once the gesture has begun, in order to track events outside 
    the element. The document listeners are then removed once the gesture has ended or cancelled.

    Delegate Messages

    State change delegate messages are send to the viewTarget. These are typically:
    
        accepts<GestureType>(aGesture)
        on<GestureType>Begin(aGesture)
        on<GestureType>Move(aGesture)
        on<GestureType>End(aGesture)
        on<GestureType>Cancel(aGesture)

    Simulating Touches with the Mouse

    Holding the SHIFT key and click-dragging the mouse can be used to simulate 2 finger 
    gestures on non-touch devices.

    Marked event semantics:

        downEvent - set onDownEvent *if* number of touchs is in correct range
        beginEvent - set when sending begin message - typically in onMove: 
        activePoints() - returns downEvent points for fingers contained in currentEvent
        upEvent - usually set on complete, not used much yet

    NOTES

    Browsers may implement their own touch gestures. To prevent these from 
    interfering with our own, be sure to call:

        aView.setTouchAction("none")

    On related views (or probably all views, to be safe) or set these in the CSS e.g.

        html * { touch-action: none; }

    TODO: move visualizer to separate class?
*/

window.GestureRecognizer = class GestureRecognizer extends ProtoClass {
    
    initPrototype () {
        this.newSlot("viewTarget", null)
        this.newSlot("shouldRemoveOnComplete", false)

        // listeners

        this.newSlot("listenerClasses", null)
        this.newSlot("viewListeners", null)
        this.newSlot("docListeners", null)
        this.newSlot("defaultListenerClasses", ["MouseListener", "TouchListener"])

        // events

        this.newSlot("overEvent", null)
        this.newSlot("leaveEvent", null)
        this.newSlot("didBegin", false)
        this.newSlot("downEvent", null)
        this.newSlot("beginEvent", null)
        this.newSlot("currentEvent", null)
        this.newSlot("lastEvent", null)
        this.newSlot("upEvent", null)

        // standard messages

        this.newSlot("acceptMessage", null)  //"accepts<GestureType>"
        this.newSlot("beginMessage", null) //"on<GestureType>Begin",
        this.newSlot("moveMessage", null) //"on<GestureType>Move",
        this.newSlot("cancelledMessage", null) // "on<GestureType>Cancelled",
        this.newSlot("completeMessage", null) // "on<GestureType>Complete",
        
        // debugging

        this.newSlot("isEmulatingTouch", false) // assumes touch and mouse events aren't mixed
        this.newSlot("isVisualDebugging", false)
        this.newSlot("fingerViewDict", null)

        // begin pressing 

        this.newSlot("isPressing", false)
        this.newSlot("minFingersRequired", 2)
        this.newSlot("maxFingersAllowed", 4)
        this.newSlot("minDistToBegin", 10)
        this.newSlot("allowsKeyboardKeys", false)
        this.newSlot("requiresKeyboardKeys", null)
        this.newSlot("shouldRequestActivation", true)
        this.newSlot("isActive", false) // only used if shouldRequestActivation === false
    }

    init () {
        super.init()
        this.setListenerClasses([]) // subclasses override this in their
        this.setDocListeners([])
        this.setViewListeners([])
        this.autoSetMessageNames()
        this.setIsEmulatingTouch(true)
        this.setFingerViewDict({})
        //this.setIsDebugging(true)
        //this.setIsVisualDebugging(true)
        return this
    }

    // -- event helpers --

    clearEvents () {
        this.setDownEvent(null)
        this.setBeginEvent(null)
        this.setCurrentEvent(null)
        return this
    }
    
    setCurrentEvent (event) {
        if (this._currentEvent !== event) {
            this.setLastEvent(this._currentEvent)
            this._currentEvent = event
        }
        return this
    }

    currentPosition () {
        return this.pointsForEvent(this.currentEvent()).first()
    }

    downPosition () {
        return this.pointsForEvent(this.downEvent()).first()
    }

    beginPosition () {
        return this.pointsForEvent(this.beginEvent()).first()
    }

    upPosition () {
        return this.pointsForEvent(this.upEvent()).first()
    }

    numberOfFingersDown () {
        const points = this.pointsForEvent(this.currentEvent())
        return points.length
    }

    currentEventIsOnTargetView () {
        const points = this.pointsForEvent(this.currentEvent())
        const p = points.first()
        const view = this.viewTarget()
        return view.containsPoint(p)
        //return points.detect(p1 => !view.containsPoint(p1)) === null
    }

    // --- listeners ---

    newListeners () {
        return this.listenerClasses().map((className) => {
            const proto = window[className];
            const listener = proto.clone();
            listener.setDelegate(this);
            return listener
        })
    }

    // --- view listeners ---

    stopViewListeners () {
        this.viewListeners().forEach(listener => listener.stop())
        this.setViewListeners([])
        return this
    }

    startViewListeners () {
        this.stopViewListeners()

        const listeners = this.newListeners().map((listener) => {
            listener.setListenTarget(this.viewTarget().element())
            listener.start()
            return listener
        })
        this.setViewListeners(listeners)
        return this
    }

    // --- doc listeners ---

    stopDocListeners () {
        this.docListeners().forEach(listener => listener.stop())
        this.setDocListeners([])
        return this
    }

    startDocListeners () {
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
    }

    // condition helpers

    hasMovedEnough () {
        // intended to be overridden by subclasses
        // e.g. a rotation recognizer might look at how much first two fingers have rotated
        const m = this.minDistToBegin()
        const d = this.currentPosition().distanceFrom(this.downPosition())
        return d >= m
    }

    hasAcceptableFingerCount () {
        const n = this.numberOfFingersDown()
        return  n >= this.minFingersRequired() &&
                n <= this.maxFingersAllowed();
    }

    hasAcceptableKeyboardState () {
        if (!this.allowsKeyboardKeys()) {
            if (Keyboard.shared().hasKeysDown()) {
                // make exception for shift key since we use it to emulate multi-touch
                if(Keyboard.shared().shiftKey().isOnlyKeyDown()) {
                    return true
                }
                return false
            }
        }
        return true
    }

    canBegin () {
        return !this.isActive() && 
                this.hasMovedEnough() && 
                this.hasAcceptableFingerCount() &&
                this.hasAcceptableKeyboardState();
    }

    // --- start / stop ---

    start () {
        this.startViewListeners()
        // We typically don't want to listen to document level events all the time.
        // Instead, some view events will start and stop the doc listeners.
        //this.startDocListeners() 
        return this
    }

    stop () {
        this.stopViewListeners()
        this.stopDocListeners()
        return this
    }

    // active

    requestActivationIfNeeded () {
        if (this.shouldRequestActivation()) {
            return GestureManager.shared().requestActiveGesture(this);
        }
        this.setIsActive(true)
        return true
    }

    isActive () {
        if (this.shouldRequestActivation()) {
            return GestureManager.shared().activeGesture() === this
        }
        return this._isActive
    }

    deactivate () {
        if (this.shouldRequestActivation()) {
            GestureManager.shared().deactivateGesture(this);
        }
        this.setIsActive(false)
        return this
    }

    // finish

    didFinish () {
        this.setDidBegin(false)
        GestureManager.shared().removeBegunGesture(this)

        // why do we do this with a delay?
        // is it needed now to prevent a move
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
    }

    // subclass helpers

    sendDelegateMessage (methodName) {
        let result = null
        assert(methodName !== null)
        const vt = this.viewTarget()

        if (this.isDebugging()) {
            console.log(this.shortTypeId() + " sending " + methodName + " to " + vt.typeId())
        }
        //try {
        if(true) {
            if (vt[methodName]) {
                result = vt[methodName].apply(vt, [this])
            } else {
                if (this.isDebugging()) {
                    console.log("gesture delegate missing method " + methodName)
                }
                result = false
            }
        }
        /*
        } catch(e) {
            console.error(this.typeId() + ".sendDelegateMessage(" + methodName + ") caught exception ", e.stack)
            result = false
            //this.cancel() // how to do this without potentially cause a loop?
            throw e
        }
        */

        return result
    }

    // points helper
    // maps mouse and touch events to a common list of points (with times and ids) format
    // so we can share the event handling code for both devices 

    pointsForEvent (event) {
        if (event === null) {
            throw new Error(this.type() + ".pointsForEvent(event) event is null")
        }

        const eventClass = event.__proto__.constructor;

        if (eventClass === MouseEvent) {
            //this.debugLog(" got mouse")
            return Mouse.shared().pointsForEvent(event)
        } else if (eventClass === TouchEvent) {   
            //this.debugLog(" got touch")
            return TouchScreen.shared().pointsForEvent(event)
        }
        
        console.warn(this.type() + " can't handle this event type yet: ", event)

        return []
    }

    // all events hook

    onEvent (event) {
        if (this.isVisualDebugging()) {
            this.updateOutlineView()
            this.updateFingerViews()
            //this.updateDebugTimer()
        }
    }

    // --- events ---

    onOver (event) {
        this.setOverEvent(event)
        this.setCurrentEvent(event)
        this.onEvent(event)
    }

    onDown (event) {
        this.setDownEvent(event)
        this.setCurrentEvent(event)
        this.onEvent(event)
    }

    onMove (event) {
        this.setCurrentEvent(event)
        this.onEvent(event)
    }

    onUp (event) {
        this.setUpEvent(event)
        //this.setCurrentEvent(event) // on Windows, the up event may not have any positions
        this.onEvent(event)
    }

    onLeave (event) {
        this.setLeaveEvent(event)
        this.setCurrentEvent(event)
        this.onEvent(event)
    }

    // --- mouse events ---

    shouldEmulateEvent (event) {
        return this.isEmulatingTouch() && 
                event.shiftKey && 
                event.__proto__.constructor === MouseEvent &&
                this.pointsForEvent(event).length === 1;
    }

    emulateDownIfNeeded (event) {
        const p1 = this.pointsForEvent(event).first()

        if (this.shouldEmulateEvent(event)) {
            // make a duplicate of the down event point with a different id
            const p2 = p1.copy().setId("emulatedTouch")
            p2.setX(p2.x() + 10)
            p2.setY(p2.y() + 10)
            event.pushCachedPoint(p2)
        }
        return this
    }

    onMouseDown (event) {        
        this.emulateDownIfNeeded(event)
        this.setDownEvent(event)
        this.onDown(event)
    }

    emulateMoveIfNeeded (event) {
        const p2 = this.pointsForEvent(event).first()

        if (this.shouldEmulateEvent(event) && this.downEvent()) {      
            // get down point and current point and add an emulated point on the other side
            const p1 = this.pointsForEvent(this.downEvent()).first()
            const v = p2.subtract(p1).negated()
            const emulatedPoint = p1.add(v).setId("emulatedTouch")
            event.pushCachedPoint(emulatedPoint)
        }

        return this
    }

    onMouseMove (event) {
        this.emulateMoveIfNeeded(event)
        this.onMove(event)
    }

    onMouseUp (event) {
        this.onUp(event)
    }

    onMouseLeave (event) {
        this.onLeave(event)
    }

    // mouse capture events

    onMouseOverCapture (event) {
        this.onOver(event)
    }

    onMouseDownCapture (event) {
        this.emulateDownIfNeeded(event)
        this.onDown(event)
    }

    onMouseMoveCapture (event) {
        this.emulateMoveIfNeeded(event)
        this.onMove(event)
    }

    onMouseUpCapture (event) {
        this.onUp(event)
    }

    onMouseLeaveCapture (event) {
        this.onLeave(event)
    }

    // touch events

    onTouchStart (event) {
        this.onDown(event)
    }

    onTouchMove (event) {
        this.onMove(event)
    }

    onTouchEnd (event) {
        this.onUp(event)
    }

    onTouchCancel (event) { 
        //this.onUp(event)
        this.cancel()
    }
    
    // touch capture events

    onTouchStartCapture (event) {
        this.onDown(event)
    }

    onTouchMoveCapture (event) {
        this.onMove(event)
    }

    onTouchEndCapture (event) {
        this.onUp(event)
    }

    onTouchCancelCapture (event) {
        //this.onUp(event)
        this.cancel()
    }

    // diff position helper

    diffPos () {
        return this.currentPosition().subtract(this.beginPosition()).floorInPlace() // floor here?
    }

    distance () {
        const dp = this.diffPos()
        const dx = Math.abs(dp.x())
        const dy = Math.abs(dp.y())
        const funcs = {
            left: (dx, dy) => dx,
            right: (dx, dy) => dx,
            up: (dx, dy) => dy,
            down: (dx, dy) => dy,
            x: (dx, dy) => dx,
            y: (dx, dy) => dy
        }
        return funcs[this.direction()](dx, dy)
    }

    gestureName () {
        return this.type().before("GestureRecognizer")
    }

    defaultMessageForState (state) {
        return "on" + this.gestureName() + state.capitalized()
    }

    defaultAcceptMessage () {
        return "accepts" + this.gestureName()
    }

    autoSetMessageNames () {
        this.setAcceptMessage(this.defaultAcceptMessage())
        this.setBeginMessage(this.defaultMessageForState("Begin"))
        this.setMoveMessage(this.defaultMessageForState("Move"))
        this.setCancelledMessage(this.defaultMessageForState("Cancelled"))
        this.setCompleteMessage(this.defaultMessageForState("Complete"))
        return this
    }

    // sending delegate messages

    doesTargetAccept () {

        // see if view accepts the gesture before we begin
        // for now, assume it accepts if it doesn't implement the accept<GestureType> method
        const vt = this.viewTarget()
        if (vt[this.acceptMessage()]) {
            if (!this.sendDelegateMessage(this.acceptMessage())) {
                this.cancel()
                return false
            }
        }

        return true
    }

    sendBeginMessage () {
        if (!this.doesTargetAccept()) {
            return this
        }
        
        this.setDidBegin(true)
        this.setBeginEvent(this.currentEvent())
        this.sendDelegateMessage(this.beginMessage())
        GestureManager.shared().addBegunGesture(this)
        return this
    }

    sendMoveMessage () {
        this.sendDelegateMessage(this.moveMessage())
        //this.didMove()
        return this
    }

    sendCompleteMessage () {
        this.sendDelegateMessage(this.completeMessage())
        this.didFinish()
        return this
    }

    sendCancelledMessage () {
        this.sendDelegateMessage(this.cancelledMessage())
        this.didFinish()
        return this
    }

    cancel () {
        this.sendCancelledMessage()
        //this.didFinish()
    }

    // ---

    cleanup () {
        this.setDownEvent(null)
        this.setCurrentEvent(null)
        this.setUpEvent(null)
        return this
    }

    shouldShowVisualDebugger () {
        return this.hasDownPointsInView() || this.isActive() // || this.isPressing());
    }

    // ---  outline view for debugging ---

    newOutlineView () {
        const v = DomView.clone()
        v.setPointerEvents("none")
        v.setBorder("1px dashed white")
        v.setBackgroundColor("transparent")
        v.setPosition("absolute")
        v.setZIndex(10000)
        return v
    }

    outlineView () {
        if (!this._outlineView) {
            const v = this.newOutlineView()
            this._outlineView = v
        }
        return this._outlineView
    }

    updateOutlineView () {
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
    }

    showOutlineView () {
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
    }



    // --- finger views for debugging ---

    newFingerView () {
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
    }

    viewForFingerId (id) {
        const fvs = this.fingerViewDict()
        let v = fvs.at(id)
        if (!v) {
            v = this.newFingerView()
            DocumentBody.shared().addSubview(v)
            fvs.atPut(id, v)
        }
        return v
    }

    removeFingerViews () {
        const dict = this.fingerViewDict()
        Object.keys(dict).forEach((id) => {
            const fingerView = dict[id]
            fingerView.removeFromParentView()
        })
        this.setFingerViewDict({})
        return this
    }

    titleForFingerNumber (n) {
        return "&nbsp;".repeat(26) + this.type() + "&nbsp;" + n + "&nbsp;of&nbsp;" + this.numberOfFingersDown() 
    }

    showFingers () {
        const points = this.pointsForEvent(this.currentEvent());
        const idsToRemove = Object.keys(this.fingerViewDict()) // TODO: move to dict
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
    }

    updateFingerViews () {
        if (this.shouldShowVisualDebugger()) {
            this.showFingers()
        } else {            
            this.removeFingerViews()
        }

        return this
    }

    updateDebugger () {
        this.updateOutlineView() 
        this.updateFingerViews()
        if (this.viewTarget()) {
            console.log(this.viewTarget().typeId() + ".updateDebugger")
        }
    }

    updateDebugTimer () {
        if (this._debugTimerId) {
            clearTimeout(this._debugTimerId) 
            this._debugTimerId = null
        }

        this._debugTimerId = setTimeout(() => { 
            this._debugTimerId = null
            this.updateDebugger() 
        }, 100);

        return this
    }

    // down points

    hasDownPointsInView () {
        if (!this.viewTarget()) {
            return false
        }

        const view = this.viewTarget();
        const points = this.allDownPoints();
        const match = points.detect(p => view.containsPoint(p)) 
        //console.log("all points.length:", points.length, " has match:", match != null)
        return match !== null
    }

    allPoints () { // TODO: some better abstraction for Touch+Mouse?
        const points = []
        points.appendItems(TouchScreen.shared().currentPoints())
        points.appendItems(Mouse.shared().currentPoints())
        return points
    }

    allDownPoints () { // TODO: some better abstraction for Touch+Mouse?
        const points = this.allPoints().select(p => p.isDown())
        return points
    }

    shortTypeId () {
        return this.typeId().replaceAll("GestureRecognizer", "")
    }

    description () {
        return this.shortTypeId() + " on " + (this.viewTarget() ? this.viewTarget().typeId() : "null view target")
    }
    
}.initThisClass()

