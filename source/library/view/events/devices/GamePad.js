"use strict"

/*
    GamePad

    A single GamePad with a unique id.

*/

window.GamePad = class GamePad extends Device {
    
    initPrototype () {
        this.newSlot("gamePadManager", null)
        this.newSlot("index", null)
        this.newSlot("id", null)
        this.newSlot("timestamp", null)
        this.newSlot("buttons", null)
        this.newSlot("axes", null)
        this.newSlot("isConnected", false)
        this.newSlot("shouldSendNotes", false)
    }

    init () {
        super.init()
        this.setButtons([])
        this.setAxes([])
        this.setIsDebugging(true)
        return this
    }

    updateData (gp) {
        assert(gp.id() === this.id()) // quick sanity check

        if (gp.timestamp !== this.timestamp()) {
            this.setTimestamp(gp.timestamp)
            this.updateButtons(gp.buttons)
            this.updateAxes(gp.axes)
        }
    }

    // buttons

    updateButtons (newButtons) {
        // make sure number of buttons is correct
        const currentButtons = this.buttons()
        while (currentButtons.length < newButtons.length) {
            currentButtons.push(0)
        }

        if (this.shouldSendNotes()) {
            // check for differences
            for (let i = 0; i < newButtons.length; i ++) {
                if (currentButtons.at(i) !== newButtons.at(i)) {
                    currentButtons.atPut(i, newButtons.at(i))
                    this.changedButtonIndexTo(i, newButtons.at(i))
                }
            }
        } else {
            this.setButtons(newButtons.shallowCopy())
        }

        return this
    }

    changedButtonIndexTo (index, isDown) {
        const note = NotificationCenter.shared().newNote().setSender(this)
        note.setName("onGamePadButton" + index + (isDown ? "Down" : "Up")) // TODO: optimize
        note.setInfo(isDown)
        note.post()
        return this
    }

    // axes

    updateAxes (newAxes) {
        // make sure number of buttons is correct
        const currentAxes = this.axes()
        while (currentAxes.length < newAxes.length) {
            currentAxes.push(0)
        }

        if (this.shouldSendNotes()) {
            // check for differences
            for (let i = 0; i < newAxes.length; i ++) {
                if (currentAxes.at(i) !== newAxes.at(i)) {
                    currentAxes.atPut(i, newAxes.at(i))
                    this.changedAxesIndexTo(i, newAxes[i])
                }
            }
        } else {
            this.setAxes(newAxes.copy())
        }

        return this
    }

    changedAxesIndexTo (index, value) {
        const note = NotificationCenter.shared().newNote().setSender(this)
        note.setName("onGamePadAxis" + index + "Changed") // TODO: optimize?
        note.setInfo(value)
        note.post()
        return this
    }

    // connecting

    onConnected () {
        this.setIsConnected(true)
        const note = NotificationCenter.shared().newNote().setSender(this)
        note.setName("onGamePadConnected")
        note.post()
        return this
    }

    onDisconnected () {
        this.setIsConnected(false)
        const note = NotificationCenter.shared().newNote().setSender(this)
        note.setName("onGamePadDisconnected")
        note.post()
        return this
    }

}.initThisClass()
