"use strict"

/*
    KeyboardKey


*/

window.KeyboardKey = class KeyboardKey extends Device {
    
    initPrototype () {
        this.newSlot("isDown", false)
        this.newSlot("code", null)
        this.newSlot("name", "")
        this.newSlot("keyboard", null)
    }

    init () {
        super.init()
        this.setIsDebugging(true)
        return this
    }

    onKeyDown (event) {
        //this.debugLog(() => this.name() + " onKeyDown " + event._id)
        let shouldPropogate = true
        this.setIsDown(true)
        return shouldPropogate
    }

    onKeyUp (event) {
        //this.debugLog(() => this.name() + " onKeyUp " + event._id)
        let shouldPropogate = true
        this.setIsDown(false)
        return shouldPropogate
    }

    isUp() {
        return !this.isDown()
    }

    isOnlyKeyDown() {
        return this.isDown() && this.keyboard().currentlyDownKeys().length
    }

    isAlphabetical(event) {
        const c = this.code()
        return c >= 65 && c <= 90
    }
    
}.initThisClass()
