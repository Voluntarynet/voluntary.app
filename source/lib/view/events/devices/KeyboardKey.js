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
        return this
    },

    onKeyDown: function (event) {
        let shouldPropogate = true
        this.setIsDown(true)
        return shouldPropogate
    },

    onKeyUp: function (event) {
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
})
