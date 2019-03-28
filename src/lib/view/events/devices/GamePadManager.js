"use strict"

/*
    GamePadManager

    - checks if gamepad API is supported
    - polls navigator gamepads state
    - creates and removes GamePad instances to match current state
    - can send notification of state changes for each GamePad

*/


window.GamePadManager = ideal.Proto.extend().newSlots({
    type: "GamePadManager",
    currentEvent: null,
    gamePadListener: null,
    gamePadsDict: null,
    isDebugging: true,
    pollPeriod: 1000, // milliseconds
}).setSlots({

    shared: function() { 
        return this.sharedInstanceForClass(GamePadManager)
    },

    init: function () {
        ideal.Proto.init.apply(this)
        this.setGamePadsDict({})
        //this.startListening()
        this.startPollingIfSupported() // could delay this until connection if listen API is supported
        return this
    },

    /*
    canListenForConnect: function() {
        return ("ongamepadconnected" in window); 
    },

    startListening: function() {
        if (this.canListenForConnect()) {
            this.setGamePadListener(GamePadListener.clone().setUseCapture(true).setElement(window).setDelegate(this))
            this.gamePadListener().setIsListening(true)
        }
        return this
    },
    
    // listener events

    
    onGamePadConnected: function(event) {
        this.poll()
        return true
    },

    onGamePadDisconnected: function(event) {
        this.poll()
        return true
    },
    */

    startPollingIfSupported: function() {
        if (this.isSupported()) {
            this.startPolling()
        }
    },

    isSupported: function() {
        return this.navigatorGamepads() !== null
    },

    navigatorGamepads: function() {
        if (navigator.getGamepads) {
            return navigator.getGamepads()
        } 
        
        if (navigator.webkitGetGamepads) {
            return navigator.webkitGetGamepads;
        }

        return null
    },

    startPolling: function() {
        if (!this._intervalId) {
            console.log(this.type() + ".startPolling()")
            this._intervalId = setInterval(() => { this.poll() }, this.pollPeriod());
        }
    },

    stopPolling: function() {
        if (this.intervalId()) {
            clearInterval(this.intervalId());
            this.setIntervalId(null)
        }
    },

    newGamePad: function(index) {
        return GamePad.clone().setGamePadManager(this)
    },

    poll: function() {
        const gamepads = this.navigatorGamepads()
        //console.log(this.type() + ".poll() gamepads.length = ", gamepads.length)
        const padDict = this.gamePadsDict()

        for (let i = 0; i < gamepads.length; i++) {
            const gp = gamepads[i];
            let gamePad = padDict[i]

            if (gp) {
                if (!gamePad) {
                    gamePad = this.newGamePad().setIndex(i).setId(gp.id)
                    gamePad.onConnected()
                    this.gamePadsDict()[i] = gamePad
                }
                gamePad.updateData(gp)

                if (this.isDebugging()) {
                    console.log("Gamepad index:" + gp.index + " id:" + gp.id + 
                    ". buttonCount:" + gp.buttons.length + " axisCount:" + gp.axes.length);
                }
            } else {
                if (gamePad) {
                    gamePad.onDisconnected()
                    padDict[i] = null
                }
            }
        }
    },


})
