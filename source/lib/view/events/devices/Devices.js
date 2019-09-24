"use strict"

/*
    Devices

    Right now, this just sets up the standard devices. 
    Later, we can using it for 
        - discovering
        - organizing
        - inspecting
        - managing
        - globally intercepting & recording input for debugging or playback
        etc.

*/


ideal.Proto.newSubclassNamed("Devices").newSlots({
    //gamePadListener: null,
    keyboard: null,
    mouse: null,
    touchScreen: null,
    gamePadManager: null,
    isSetup: false,
}).setSlots({

    shared: function() { 
        return this.sharedInstanceForClass(Devices)
    },

    init: function () {
        ideal.Proto.init.apply(this)
        this.setupIfNeeded() 
        return this
    },

    setupIfNeeded: function() {
        if (!this.isSetup()) {
            Mouse.shared()
            Keyboard.shared()
            TouchScreen.shared()
            //GamePadManager.shared()
            this.setIsSetup(true)
        }
        return this
    },

    currentTouchOrMouseEvent: function() {
        // needed?
        const me = Mouse.shared().currentEvent()
        const te = TouchScreen.shared().currentEvent()
        const es = [me, te]
        es.filter(e => !TypeError.isNullOrUndefined(e))
        return es.min(e => e.timeStamp)
    },
})
