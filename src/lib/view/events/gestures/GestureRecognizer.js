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
    isActive: true,
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

})

//this.setTouchAction("none") // testing
