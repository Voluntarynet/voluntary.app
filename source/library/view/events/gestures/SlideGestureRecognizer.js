"use strict"

/*

    SlideGestureRecognizer

    This gets tricky as we need to follow movement outside the view.
    To do this, we add special event move and up handlers to the document after getting
    a down event and then remove them after the up event. 
    
    We ignore the view's own move and up events.

    Delegate messages :

        onSlideBegin
        onSlideMove
        onSlideComplete
        onSlideCancelled
    
    Gesture state info methods:

        direction()
        distance() 
        downPosInView()

    TODO

        make multitouch

        optimization: floor the move event points and only send delegate messages if
        new position is different from last?

*/


window.SlideGestureRecognizer = class SlideGestureRecognizer extends GestureRecognizer {
    
    initPrototype () {
        this.newSlot("direction", "left")
        this.newSlot("validDirectionsDict", { left: 1, right: 2, up: 3, down: 4 })
        this.newSlot("maxPerpendicularDistToBegin", 10) // will not begin if this is exceeded
        //downPositionInTarget: null,
    }

    init () {
        super.init()
        this.setListenerClasses(this.defaultListenerClasses())     
        this.setMinFingersRequired(1)
        this.setMaxFingersAllowed(1)
        this.setMinDistToBegin(10)
        //this.setIsDebugging(false)
        return this
    }

    setDirection (directionName) {
        assert(this.validDirectionsDict().hasOwnProperty(directionName));
        this._direction = directionName
        return this
    }

    setNumberOfTouchesRequired (n) {
        assert(n === 1) // need to add multi-touch support
        this._numberOfTouchesRequired = n
        return this
    }

    // --- events --------------------------------------------------------------------

    onDown (event) {
        super.onDown(event)

        if (!this.isPressing()) {
            if (this.hasAcceptableFingerCount()) {
                this.setIsPressing(true)
                this.setBeginEvent(event)
                this.startDocListeners()
            }
        }
    }

    onMove (event) {
        super.onMove(event)

        if (this.isPressing()) {
            if (!this.isActive() && this.hasMovedTooMuchPerpendicular()) {
                this.cancel()
                return this
            }

            if (!this.isActive() && this.hasMovedEnough()) {
                if(this.requestActivationIfNeeded()) {
                    //this.setIsActive(true)
                    this.sendBeginMessage() // being
                }
            }
        
            if (this.isActive()) {
                this.sendMoveMessage() // move
            }
        }
    }

    // -----------

    onUp (event) {
        super.onUp(event)

        if (this.isPressing()) {
            this.setIsPressing(false)
            if (this.isActive()) {
                this.sendCompleteMessage() // complete
            }
            this.finish()
        }

        return true
    }

    cancel () {
        if (this.isActive()) {
            this.sendCancelledMessage()
        }
        this.finish()
        return this
    }

    finish () {
        //this.debugLog(".finish()")
        this.setIsPressing(false)
        this.deactivate()
        this.stopDocListeners()
        this.didFinish()
        return this
    }

    // ----------------------------------

    hasMovedTooMuchPerpendicular () {
        let m = this.maxPerpendicularDistToBegin()
        let dp = this.diffPos()

        let funcs = {
            left: (dx, dy) => dy,
            right: (dx, dy) => dy,
            up: (dx, dy) => dx,
            down: (dx, dy) => dx
        }

        let r = Math.abs(funcs[this.direction()](dp.x(), dp.y())) > m
        return r
    }

    hasMovedEnough () {
        let m = this.minDistToBegin()
        let dp = this.diffPos()

        let funcs = {
            left: (dx, dy) => -dx,
            right: (dx, dy) =>  dx,
            up: (dx, dy) =>  dy,
            down: (dx, dy) => -dy
        }

        let r = funcs[this.direction()](dp.x(), dp.y()) > m
        return r
    }

    // --- helpers ----

    diffPos () {
        let cp = this.currentPosition()
        let bp = this.beginPosition()

        assert(cp)
        assert(bp)
        
        let p = cp.subtract(bp).floorInPlace() // floor here?
        let dx = p.x()
        let dy = p.y()
        let funcs = {
            left: (p) => p.setX(Math.min(dx, 0)),
            right: (p) => p.setX(Math.max(dx, 0)),
            up: (p) => p.setY(Math.max(dy, 0)),
            down: (p) => p.setY(Math.min(dy, 0))
        }

        funcs[this.direction()](p)
        return p
    }

    distance () {
        let p = this.diffPos()
        let dx = p.x()
        let dy = p.y()
        let funcs = {
            left: (dx, dy) => dx,
            right: (dx, dy) => dx,
            up: (dx, dy) => dy,
            down: (dx, dy) => dy
        }
        return Math.abs(funcs[this.direction()](dx, dy))
    }

}.initThisClass()
