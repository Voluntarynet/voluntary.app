"use strict"

/*
    GamePad

    A single GamePad with a unique id.

*/


window.GamePad = ideal.Proto.extend().newSlots({
    type: "GamePad",
    gamePadManager: null,
    id: null,
    index: null,
    timestamp: null,
    buttons: null,
    axes: null,
    isConnected: false,
    isDebugging: true,
    shouldSendNotes: false
}).setSlots({

    init: function () {
        ideal.Proto.init.apply(this)
        this.setCurrentButtons([])
        return this
    },

    updateData: function(gp) {
        assert(gp.id() === this.id()) // quick sanity check

        if (gp.timestamp !== this.timestamp()) {
            this.setTimestamp(gp.timestamp)
            this.updateButtons(gp.buttons)
            //this.updateAxes(gp.axes)
        }
    },

    // buttons

    updateButtons: function(newButtons) {
        // make sure number of buttons is correct
        const currentButtons = this.buttons()
        while (currentButtons.length < newButtons.length) {
            currentButtons.push(0)
        }

        if (this.shouldSendNotes()) {
            // check for differences
            for (let i = 0; i < newButtons.length; i ++) {
                if (currentButtons[i] !== newButtons[i]) {
                    currentButtons[i] = newButtons[i]
                    this.changedButtonIndexTo(i, newButtons[i])
                }
            }
        } else {
            this.setButtons(buttons.copy())
        }

        return this
    },

    changedButtonIndexTo: function(index, isDown) {
        const note = NotificationCenter.shared().newNote().setSender(this)
        note.setName("onGamePadButton" + index + (isDown ? "Down" : "Up")) // TODO: optimize
        note.setInfo(isDown)
        note.post()
        return this
    },

    // connecting

    onConnected: function() {
        this.setIsConnected(true)
        const note = NotificationCenter.shared().newNote().setSender(this)
        note.setName("onGamePadConnected")
        note.post()
        return this
    },

    onDisconnected: function() {
        this.setIsConnected(false)
        const note = NotificationCenter.shared().newNote().setSender(this)
        note.setName("onGamePadDisconnected")
        note.post()
        return this
    },

})
