"use strict"

/*
    Keyboard

    Global shared instance that tracks current keyboard state in window coordinates.
    Registers for capture key events on document.body.

*/


window.Keyboard = ideal.Proto.extend().newSlots({
    type: "Keyboard",
    codeToKeys: null, // dictionary of KeyboardKey objects
    isDebugging: false,
    keyboardListener: null,
}).setSlots({
    shared: function() {   
        return this.sharedInstanceForClass(Keyboard)
    },

    init: function () {
        ideal.Proto.init.apply(this)
        this.setupCodeToKeys()
        this.startListening()
        return this
    },

    startListening: function() {
        this.setKeyboardListener(KeyboardListener.clone().setUseCapture(true).setElement(document.body).setDelegate(this))
        this.keyboardListener().setIsListening(true)
        return this
    },

    setupCodeToKeys: function() {
        const dict = {}
        const k2c = this.keyNameToCodeMap()
        Object.keys(k2c).forEach((name) => {
            const code = k2c[name]
            dict[code] = KeyboardKey.clone().setName(name).setCode(code)
        })
        this.setCodeToKeys(dict)
        return this
    },

    keyForCode: function(aCode) {
        return this.codeToKeys()[aCode]
    },

    keyForName: function(aName) {
        const code = this.keyCodeForName(aName)
        return this.keyForCode(code)
    },

    nameForKeyCode: function(aCode) {
        return this.keyForCode(aCode).name()
    },

    keyCodeForName: function(aName) {
        return this.keyNameToCodeMap()[aName]
    },

    keyNameToCodeMap: function() {
        return { 
            backspace: 8,
            tab: 9,
            enter: 13,
            shift: 16,
            ctrl: 17,
            alt: 18,
            pauseBreak: 19,
            capslock: 20,
            esc: 27,
            space: 32,
            pageUp: 33,
            pageDown: 34,
            end: 35,
            home: 36,
            leftArrow: 37,
            upArrow: 38,
            rightArrow: 39,
            downArrow: 40,
            insert: 45,
            delete: 46,
            0: 48,
            1: 49,
            2: 50,
            3: 51,
            4: 52,
            5: 53,
            6: 54,
            7: 55,
            8: 56,
            9: 57,
            a: 65,
            b: 66,
            c: 67,
            d: 68,
            e: 69,
            f: 70,
            g: 71,
            h: 72,
            i: 73,
            j: 74,
            k: 75,
            l: 76,
            m: 77,
            n: 78,
            o: 79,
            p: 80,
            q: 81,
            r: 82,
            s: 83,
            t: 84,
            u: 85,
            v: 86,
            w: 87,
            x: 88,
            y: 89,
            z: 90,
            leftWindow: 91,
            rightWindow: 92,
            select: 93,
            numpad0: 96,
            numpad1: 97,
            numpad2: 98,
            numpad3: 99,
            numpad4: 100,
            numpad5: 101,
            numpad6: 102,
            numpad7: 103,
            numpad8: 104,
            numpad9: 105,
            multiply: 106,
            plus: 107,
            minus: 109,
            decimalPoint: 110,
            divide: 111,
            f1: 112,
            f2: 113,
            f3: 114,
            f4: 115,
            f5: 116,
            f6: 117,
            f7: 118,
            f8: 119,
            f9: 120,
            f10: 121,
            f11: 122,
            f12: 123,
            numLock: 144,
            scrollLock: 145,
            semicolon: 186,
            equalsign: 187,
            comma: 188,
            dash: 189,
            period: 190,
            forwardSlash: 191,
            graveAccent: 192,
            openBracket: 219,
            backslash: 220,
            closeBracket: 221,
            singleQuote: 222 
        };
    },

    keyForCode: function(aCode) {
        return this.codeToKeys()[aCode]
    },

    // -- events ---

    showCodeToKeys: function() {
        console.log("Keyboard:")
        Object.keys(this.codeToKeys()).forEach((code) => {
            console.log("  code: ", code + " key name: ", this.codeToKeys()[code].name())
        })
        return this
    },

    keyForEvent: function(event) {
        const code = event.keyCode
        const key = this.codeToKeys()[code]
        return key
    },

    onKeyDownCapture: function (event) {
        //console.log("event.metaKey = ", event.metaKey)
        
        const shouldPropogate = true
        const key = this.keyForEvent(event)
        key.onKeyDown(event)

        if (this.isDebugging()) {
            console.log(this.typeId() + ".onKeyDown " + key.name())
        }
        
        return shouldPropogate
    },

    onKeyUpCapture: function (event) {
        const shouldPropogate = true
        const key = this.keyForEvent(event)
        key.onKeyUp(event)

        if (this.isDebugging()) {
            console.log(this.typeId() + ".onKeyUp " + key.name())
        }

        return shouldPropogate
    },
    
    // --- special ---

    methodNameForKeyCode: function(keyCode) {
        const key = this.keyForCode(keyCode)
        const methodName = "on" + key.name() + "KeyDown";
        return methodName
    },

    specialKeyCodes: function () { 
        return {
            8:  "delete", // "delete" on Apple keyboard
            9:  "tab", 
            13: "enter", 
            16: "shift", 
            17: "control", 
            18: "alt", 
            20: "capsLock", 
            27: "escape", 
            33: "pageUp", 
            34: "pageDown", 
            37: "leftArrow",  
            38: "upArrow",  
            39: "rightArrow", 
            40: "downArrow",  
            46: "delete", 
            /* 
			107: "add",  
			109: "subtract",  
			111: "divide",  
			144: "numLock",  
			145: "scrollLock",  
			186: "semiColon",  
			187: "equalsSign", 
			*/ 
        }
    },
	
    specialNameForKeyEvent: function(event) {
        const code = event.keyCode
        const result = this.specialKeyCodes()[code]
		
        if (event.shiftKey && (code === 187)) {
            return "plus"
        }
		
        //console.log("specialNameForKeyEvent ", code, " = ", result)
		
        return result
    },

    // get key helpers

    shiftKey: function() {
        return this.keyForName("shift")
    },

    controlKey: function() {
        return this.keyForName("ctrl")
    },

    leftCommandKey: function() {
        return this.keyForName("leftWindow")
    },

    rightCommandKey: function() {
        return this.keyForName("select")
    },

    // get key state helpers

    shiftIsDown: function() {
        return this.shiftKey().isDown()
    },

    commandIsDown: function() {
        return this.leftCommandKey().isDown() || this.rightCommandKey().isDown()
    },


    equalSignKey: function() {
        return this.keyForName("equalsign")
    },

    minusKey: function() {
        return this.keyForName("dash")
    },

    plusKey: function() {
        return this.keyForName("plus")
    },

    plusIsDown: function() {
        return this.plusKey().isDown()
    },

    currentlyDownKeys: function() {
        return Object.values(this.codeToKeys()).select(key => key.isDown())
    },

    currentlyUpKeys: function() {
        return Object.values(this.codeToKeys()).select(key => !key.isDown())
    },

    hasKeysDown: function() {
        return this.currentlyUpKeys().length !== 0
    },

    downKeyNames: function() {
        return Keyboard.shared().currentlyDownKeys().map(k => k.name())
    },

    show: function() {
        console.log(this.typeId() + " downKeys: ", this.downKeyNames())
    },
})
