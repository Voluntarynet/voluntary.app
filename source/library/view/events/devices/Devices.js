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

window.Devices = class Devices extends ProtoClass {
    
    initPrototype () {
        this.newSlots({
            //gamePadListener: null,
            keyboard: null,
            mouse: null,
            touchScreen: null,
            gamePadManager: null,
            isSetup: false,
        })
    }

    /*
    shared () { 
        return this.sharedInstanceForClass(Devices)
    }
    */

    init  () {
        super.init()
        this.setupIfNeeded() 
        return this
    }

    setupIfNeeded () {
        if (!this.isSetup()) {
            Mouse.shared()
            Keyboard.shared()
            TouchScreen.shared()
            //GamePadManager.shared()
            this.setIsSetup(true)
        }
        return this
    }

    currentTouchOrMouseEvent () {
        // needed?
        const me = Mouse.shared().currentEvent()
        const te = TouchScreen.shared().currentEvent()
        const es = [me, te]
        es.filter(e => !TypeError.isNullOrUndefined(e))
        return es.min(e => e.timeStamp)
    }
    
}.initThisClass()
