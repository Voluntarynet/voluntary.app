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
        //this.newSlot("gamePadListener", null)
        this.newSlot("keyboard", null)
        this.newSlot("mouse", null)
        this.newSlot("touchScreen", null)
        this.newSlot("gamePadManager", null)
        this.newSlot("isSetup", false)
    }

    init () {
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
