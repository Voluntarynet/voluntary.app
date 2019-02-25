/*
    GestureRecognizer

    A DivView has a list of gestureRecognizers. 
    It forwards relevant events to it's recognizers. 
    These can initiate the recognizer to start listening to document.body events.

    Example:

        1. aView.onMouseDown -> forwarded to -> SlideGestureRecognizer
        1.a. starts capturing on document.body
        2. onMouseMoveCapture, if dx > min,  send theView.recognizedSlideGesture(this);
        3. onMouseUpCapture, send theView.recognizedSlideGestureComplete(this)
        3.a. stop capturing on document.body

*/

"use strict"

window.GestureRecognizer = ideal.Proto.extend().newSlots({
    type: "GestureRecognizer",
    
    viewTarget: null,
    state: null,

    currentEvent: null, 

    listenerClasses: null,
    viewListeners: null, 
    docListeners: null, 
}).setSlots({
    init: function () {
        this.setListenerClasses([]) // subclasses override this in their init
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

        let listeners = this.newListeners().forEach((listener) => {
            listener.setElement(this.viewTarget().element())
            listener.start()
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

        let listeners = this.newListeners().forEach((listener) => {
            listener.setElement(document.body)
            listener.start()
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
