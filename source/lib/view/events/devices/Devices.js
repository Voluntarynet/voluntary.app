"use strict"

/*
    Devices

    Setup and manage devices.

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
})
