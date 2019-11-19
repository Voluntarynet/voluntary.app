"use strict"

/*
    KeyboardKey


*/

ideal.Proto.newSubclassNamed("KeyboardKey").newSlots({
    isDown: false,
    code: null,
    name: "",
    keyboard: null,
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
        this.setIsDebugging(true)
        return this
    },

    onKeyDown: function (event) {
        //this.debugLog(() => this.name() + " onKeyDown " + event._id)
        let shouldPropogate = true
        this.setIsDown(true)
        return shouldPropogate
    },

    onKeyUp: function (event) {
        //this.debugLog(() => this.name() + " onKeyUp " + event._id)
        let shouldPropogate = true
        this.setIsDown(false)
        return shouldPropogate
    },

    isUp: function() {
        return !this.isDown()
    },

    isOnlyKeyDown: function() {
        return this.isDown() && this.keyboard().currentlyDownKeys().length
    },

    isAlphabetical: function(event) {
        const c = this.code()
        return c >= 65 && c <= 90
    },
})
