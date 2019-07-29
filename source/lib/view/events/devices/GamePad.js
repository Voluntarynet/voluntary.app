"use strict"

/*
    GamePad

    A single GamePad with a unique id.

*/


ideal.Proto.newSubclassNamed("GamePad").newSlots({
    gamePadManager: null,
    index: null,
    id: null,
    timestamp: null,
    buttons: null,
    axes: null,
    isConnected: false,
    isDebugging: true,
    shouldSendNotes: false
}).setSlots({

    init: function () {
        ideal.Proto.init.apply(this)
        this.setButtons([])
        this.setAxes([])
        return this
    },

    updateData: function(gp) {
        assert(gp.id() === this.id()) // quick sanity check

        if (gp.timestamp !== this.timestamp()) {
            this.setTimestamp(gp.timestamp)
            this.updateButtons(gp.buttons)
            this.updateAxes(gp.axes)
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
            this.setButtons(newButtons.copy())
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

    // axes

    updateAxes: function(newAxes) {
        // make sure number of buttons is correct
        const currentAxes = this.axes()
        while (currentAxes.length < newAxes.length) {
            currentAxes.push(0)
        }

        if (this.shouldSendNotes()) {
            // check for differences
            for (let i = 0; i < newAxes.length; i ++) {
                if (currentAxes[i] !== newAxes[i]) {
                    currentAxes[i] = newAxes[i]
                    this.changedAxesIndexTo(i, newAxes[i])
                }
            }
        } else {
            this.setAxes(newAxes.copy())
        }

        return this
    },

    changedAxesIndexTo: function(index, value) {
        const note = NotificationCenter.shared().newNote().setSender(this)
        note.setName("onGamePadAxis" + index + "Changed") // TODO: optimize?
        note.setInfo(value)
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
