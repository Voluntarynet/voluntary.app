"use strict"

/*

    TouchScreen

    Global shared instance that tracks current touch state in window coordinates.
    Registers for capture events on document.body.

*/


ideal.Proto.newSubclassNamed("TouchScreen").newSlots({
    currentEvent: null,
    lastEvent: null,
    touchListener: null,
    //isVisualDebugging: false,
    isDebugging: false,
}).setSlots({

    isSupported: function() {
        // return WebBrowserWindow.isTouchDevice()
        let result = false 
        if ("ontouchstart" in window) { result = true; } // works on most browsers 
        if (navigator.maxTouchPoints) { result = true; } // works on IE10/11 and Surface	
        return result
    },

    shared: function() { 
        return this.sharedInstanceForClass(TouchScreen)
    },

    init: function () {
        ideal.Proto.init.apply(this)
        this.startListening()
        if (this.isDebugging()) {
            console.log(this.typeId() + ".init()")
        }
        return this
    },

    setCurrentEvent: function(event) {
        if (this._currentEvent !== event) {
            this.setLastEvent(this._currentEvent)
            this._currentEvent = event
            if (this.isDebugging()) {
                console.log(this.type() + " touch count: " + this.currentPoints().length)
            }
            //Devices.shared().setCurrentEvent(event)
        }
        return this
    },

    startListening: function() {
        this.setTouchListener(TouchListener.clone().setUseCapture(true).setListenTarget(document.body).setDelegate(this))
        this.touchListener().setIsListening(true)
        return this
    },

    // events

    onTouchBeginCapture: function(event) {
        if (this.isDebugging()) {
            console.log(this.type() + ".onTouchBeginCapture()")
        }
        this.setCurrentEvent(event)
        //this.handleLeave(event)
        return true
    },

    /*
    elementsForEvent: function(event) {
        const elements = [];
        const points = this.pointsForEvent(event)
        points.forEach((point) => {
            const e = document.elementFromPoint(p.x(), p.y());
            if (e) {
                elements.push(e)
            }
        })
        return elements
    },
    */

    lastPointForId: function(id) {
        const lastPoints = this.pointsForEvent(this.lastEvent())
        return lastPoints.detect(p => p.id() === id)
    },

    currentPointForId: function(id) {
        const currentPoints = this.pointsForEvent(this.currentEvent())
        return currentPoints.detect(p => p.id() === id)
    },

    onTouchMoveCapture: function (event) {
        this.setCurrentEvent(event)
        //this.handleLeave(event)
        return true
    },

    onTouchEndCapture: function(event) {
        this.setCurrentEvent(event)
        //this.handleLeave(event)
        return true
    },

    pointForTouch: function(touch) {
        assert(event.__proto__.constructor === TouchEvent)
        const p = EventPoint.clone()
        p.setId(touch.identifier)
        p.setTarget(touch.target)
        p.set(touch.pageX, touch.pageY)  // document position
        p.setTimeToNow()
        p.setIsDown(true)
        p.setEvent(touch)
        //p.findOverview()
        return p
    },

    justPointsForEvent: function(event) {
        //if (this.isDebugging()) {
        //  console.log("touches.length = ", event.touches.length)
        //}

        const points = []
        // event.touches isn't a proper array, so we can't enumerate it normally
        const touches = event.touches // all current touches
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i]
            const p = this.pointForTouch(touch)
            points.append(p)
        }

        return points
    },


    pointsForEvent: function(event) {
        if (!Event_hasCachedPoints(event)) {
            event.preventDefault() // needed to prevent browser from handling touches?

            const points = this.justPointsForEvent(event)
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

    // There are no standard onTouchLeave & onTouchOver events,
    // so this is an attempt to add them. Only really need them
    // for visual gesture debugging at the moment though.
    
    /*
    sendEventToView: function(eventName, event, aView) {
        // send to listeners instead?
        aView.gestureRecognizers().forEach((gr) => {
            gr[eventName].apply(gr, [event])
        })
        return this
    },

    handleLeave: function(event) {
        // an attempt to add onTouchLeave and onTouchOver events
        const currentPoints = this.pointsForEvent(this.currentEvent())

        currentPoints.forEach((cp) => {
            const lp = this.lastPointForId(cp.id())
            if (lp) {
                const lastView    = lp.overview()
                const currentView = cp.overview()

                // check if overView is the same
                if (lastView !== currentView) {
                    this.sendEventToView("onTouchLeave", event, lastView)
                    this.sendEventToView("onTouchOver", event, currentView)
                }
            } else {
                // this is a new finger
            }
        })

        return this
    },
    */
})
