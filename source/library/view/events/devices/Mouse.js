"use strict"

/*
    Mouse

    Global shared instance that tracks current mouse state in window coordinates.
    Registers for capture mouse events on document.body.

*/


ideal.Proto.newSubclassNamed("Mouse").newSlots({
    isDown: false,
    downEvent: null,
    currentEvent: null,
    upEvent: null,
    mouseListener: null,
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
        this.startListening()
        return this
    },

    shared: function() { 
        return this.sharedInstanceForClass(Mouse)
    },

    setCurrentEvent: function(event) {
        this._currentEvent = event
        //Devices.shared().setCurrentEvent(event)
        return this
    },

    startListening: function() {
        this.setMouseListener(MouseListener.clone().setUseCapture(true).setListenTarget(document.body).setDelegate(this))
        this.mouseListener().setIsListening(true)
        return this
    },

    // positions

    downPos: function() {
        return this.pointForEvent(this.downEvent())
    },

    currentPos: function() {
        return this.pointForEvent(this.currentEvent())
    },

    upPos: function() {
        return this.pointForEvent(this.upEvent())
    },

    // events

    onMouseDownCapture: function(event) {
        this.setDownEvent(event)
        this.setCurrentEvent(event)
        this.setIsDown(true);
        return true
    },

    onMouseMoveCapture: function (event) {
        this.setCurrentEvent(event)
        return true
    },

    onMouseUpCapture: function(event) {
        this.setCurrentEvent(event)
        this.setUpEvent(event)
        this.setIsDown(false);
        return true
    },  

    // -- helpers ---

    pointForEvent: function(event) {
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
    },

    dragVector: function(event) {   
        if (this.downPos()) {
            return this.currentPos().subtract(this.downPos())
        }
        /*  
        if (this.isDown()) {
            return this.currentPos().subtract(this.downPos())
        }
        */
        return Point.clone()
    },

    pointsForEvent: function(event) {
        if (!Event_hasCachedPoints(event)) {
            const points = [this.pointForEvent(event)]
            Event_setCachedPoints(event, points)
        }

        return Event_cachedPoints(event)
    },

    currentPoints: function() {
        if (this.currentEvent()) {
            return this.pointsForEvent(this.currentEvent())
        }
        return []
    },

    // full event name

    downMethodNameForEvent: function(event) {
        const s = Keyboard.shared().modsAndKeyNameForEvent(event)
        return "on" + s + "MouseDown"
    },

    upMethodNameForEvent: function(event) {
        const s = Keyboard.shared().modsAndKeyNameForEvent(event)
        return "on" + s + "MouseUp"
    },
    
})
