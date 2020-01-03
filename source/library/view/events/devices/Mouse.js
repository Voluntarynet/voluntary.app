"use strict"

/*

    Mouse

    Global shared instance that tracks current mouse state in window coordinates.
    Registers for capture mouse events on document.body.

*/

window.Mouse = class Mouse extends Device {
    
    initPrototype () {
        this.newSlots({
            isDown: false,
            downEvent: null,
            currentEvent: null,
            upEvent: null,
            mouseListener: null,
        })
    }

    init () {
        super.init()
        this.startListening()
        return this
    }

    /*
    shared () { 
        return this.sharedInstanceForClass(Mouse)
    }
    */

    setCurrentEvent (event) {
        this._currentEvent = event
        //Devices.shared().setCurrentEvent(event)
        return this
    }

    startListening () {
        this.setMouseListener(MouseListener.clone().setUseCapture(true).setListenTarget(document.body).setDelegate(this))
        this.mouseListener().setIsListening(true)
        return this
    }

    // positions

    downPos () {
        return this.pointForEvent(this.downEvent())
    }

    currentPos () {
        return this.pointForEvent(this.currentEvent())
    }

    upPos () {
        return this.pointForEvent(this.upEvent())
    }

    // events

    onMouseDownCapture (event) {
        this.setDownEvent(event)
        this.setCurrentEvent(event)
        this.setIsDown(true);
        return true
    }

    onMouseMoveCapture (event) {
        this.setCurrentEvent(event)
        return true
    }

    onMouseUpCapture (event) {
        this.setCurrentEvent(event)
        this.setUpEvent(event)
        this.setIsDown(false);
        return true
    }  

    // -- helpers ---

    pointForEvent (event) {
        assert(event.__proto__.constructor === MouseEvent)

        const p = EventPoint.clone()
        p.set(event.pageX, event.pageY) // document position
        p.setTarget(event.target)
        p.setTimeToNow()
        p.setId("mouse")
        p.setState(event.buttons)
        p.setIsDown(event.buttons !== 0)
        p.setEvent(event)
        //p.findOverview()

        return p
    }

    dragVector (event) {   
        if (this.downPos()) {
            return this.currentPos().subtract(this.downPos())
        }
        /*  
        if (this.isDown()) {
            return this.currentPos().subtract(this.downPos())
        }
        */
        return Point.clone()
    }

    pointsForEvent (event) {
        if (!event.hasCachedPoints()) {
            const points = [this.pointForEvent(event)]
            event.setCachedPoints(points)
        }

        return event.cachedPoints()
    }

    currentPoints () {
        if (this.currentEvent()) {
            return this.pointsForEvent(this.currentEvent())
        }
        return []
    }

    // full event name

    downMethodNameForEvent (event) {
        const s = Keyboard.shared().modsAndKeyNameForEvent(event)
        return "on" + s + "MouseDown"
    }

    upMethodNameForEvent (event) {
        const s = Keyboard.shared().modsAndKeyNameForEvent(event)
        return "on" + s + "MouseUp"
    }
    
}.initThisClass()
