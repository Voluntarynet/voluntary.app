"use strict"

/*
    Keyboard


*/

window.KeyboardKey = ideal.Proto.extend().newSlots({
    type: "KeyboardKey",
    isDown: false,
    code: null,
    name: "",
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
})
