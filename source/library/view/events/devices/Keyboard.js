"use strict"

/*
    Keyboard

    Global shared instance that tracks current keyboard state.
    Registers for capture key events on document.body.

    MacOS/iOS note:

        These Mac keys use different names in JS events:
        CommandLeft -> MetaLeft
        CommandRight -> MetaRight
        Option/Alt -> Alternate
        Control -> Control
        Function -> [not seen by JS either as key event or modifier]

*/


window.Keyboard = class Keyboard extends Device {
    initPrototype () {
        this.newSlot("codeToKeys", null).setComment("dictionary of KeyboardKey objects")
        this.newSlot("keyboardListener", null)
    }

    /*
    shared() {   
        return this.sharedInstanceForClass(Keyboard)
    }
    */

    init () {
        super.init()
        this.setupCodeToKeys()
        this.startListening()
        return this
    }

    startListening () {
        this.setKeyboardListener(KeyboardListener.clone().setUseCapture(true).setListenTarget(document.body).setDelegate(this))
        this.keyboardListener().setIsListening(true)
        return this
    }

    setupCodeToKeys () {
        const dict = {}
        const c2k = this.keyCodesToNamesDict()
        Object.keys(c2k).forEach((code) => {
            const name = c2k[code]
            dict[code] = KeyboardKey.clone().setName(name).setCode(code).setKeyboard(this)
        })
        this.setCodeToKeys(dict)
        return this
    }

    keyForCode (aCode) {
        return this.codeToKeys()[aCode]
    }

    keyForName (aName) {
        const code = this.keyCodeForName(aName)
        return this.keyForCode(code)
    }

    nameForKeyCode (aCode) {
        const key = this.keyForCode(aCode)
        if (key) {
            return key.name()
        }
        return null
    }

    k2c () {
        if (!this._k2c) {
            this._k2c = {}
            const c2k = this.keyCodesToNamesDict()
            Object.keys(c2k).forEach((c) => {
                const k = c2k[c]
                this._k2c[k] = c
            })
        }
        return this._k2c
    }

    keyCodeForName (aName) {
        return this.k2c()[aName]
    }

    
    eventIsJustModifierKey (event) {
        const name = this.nameForKeyCode(event.keyCode)
        return this.allModifierNames().contains(name)
    }


    keyCodesToNamesDict () {
        return {
            8: "Backspace",
            9: "Tab",
            13: "Enter",
            16: "Shift",
            17: "Control",
            18: "Alternate",
            19: "PauseBreak",
            20: "Capslock",
            27: "Escape",
            32: "Space",
            33: "PageUp",
            34: "PageDown",
            35: "End",
            36: "Home",
            37: "LeftArrow",
            38: "UpArrow",
            39: "RightArrow",
            40: "DownArrow",
            45: "Insert",
            46: "Delete",
            48: "0",
            49: "1",
            50: "2",
            51: "3",
            52: "4",
            53: "5",
            54: "6",
            55: "7",
            56: "8",
            57: "9",
            65: "a", // characters are the same code for upper and lower case in JS
            66: "b",
            67: "c",
            68: "d",
            69: "e",
            70: "f",
            71: "g",
            72: "h",
            73: "i",
            74: "j",
            75: "k",
            76: "l",
            77: "m",
            78: "n",
            79: "o",
            80: "p",
            81: "q",
            82: "r",
            83: "s",
            84: "t",
            85: "u",
            86: "v",
            87: "w",
            88: "x",
            89: "y",
            90: "z",
            91: "MetaLeft",
            92: "RightWindow", // correct?
            93: "MetaRight",
            96: "NumberPad0",
            97: "NumberPad1",
            98: "NumberPad2",
            99: "NumberPad3",
            100: "NumberPad4",
            101: "NumberPad5",
            102: "NumberPad6",
            103: "NumberPad7",
            104: "NumberPad8",
            105: "NumberPad9",
            106: "Multiply",
            107: "Plus",
            109: "Minus",
            110: "DecimalPoint",
            111: "Divide",
            112: "Function1",
            113: "Function2",
            114: "Function3",
            115: "Function4",
            116: "Function5",
            117: "Function6",
            118: "Function7",
            119: "Function8",
            120: "Function9",
            121: "Function10",
            122: "Function11",
            123: "Function12",
            144: "NumberLock",
            145: "ScrollLock",
            186: "Semicolon",
            187: "EqualsSign",
            188: "Comma",
            189: "Dash",
            190: "Period",
            191: "ForwardSlash",
            192: "GraveAccent",
            219: "OpenBracket",
            220: "Backslash",
            221: "CloseBracket",
            222: "SingleQuote",
        }
    }

    /*
    shiftChangingKeysDict () {
        // Based on a Macbook Pro keyboard. 
        // Not sure if this is platform specific.

        return {
            "\`": ["Tilda", "~"],
            "1": ["ExclaimationPoint", "!"],
            "2": ["AtSymbol", "@"],
            "3": ["Hash", "#"],
            "4": ["DollarSign", "$"],
            "5": ["Percent", "%"],
            "6": ["Carot"],
            "7": ["Ampersand", "&"],
            "8": ["Asterisk", "*"],
            "9": ["OpenParenthesis", "("],
            "0": ["CloseParenthesis", ")"],
            "-": ["Underscore", "_"],
            "=": ["Plus", "+"],
            "[": ["OpenCurlyBracket", "{"],
            "]": ["CloseCurlyBracket", "}"],
            "\\": ["Pipe", "|"],
            ";": ["Colon", ":"],
            "'": ["DoubleQuote", "\""],
            ",": ["LessThan", "<"],
            ".": ["GreaterThan", ">"],
            "/": ["QuestionMark", "?"],
        }
    }
    */

    shiftDict () {
        // Based on a Macbook Pro keyboard. 
        // Not sure if this is platform specific.

        return {
            "~": "Tilda",
            "!": "ExclaimationPoint",
            "@": "AtSymbol",
            "#": "Hash",
            "$": "DollarSign",
            "%": "Percent",
            "^": "Carot",
            "&": "Ampersand",
            "*": "Asterisk",
            "(": "OpenParenthesis",
            ")": "CloseParenthesis",
            "_": "Underscore",
            "+": "Plus",
            "{": "OpenCurlyBracket",
            "}": "CloseCurlyBracket",
            "|": "Pipe",
            ":": "Colon",
            "\\": "DoubleQuote",
            "<": "LessThan",
            ">": "GreaterThan",
            "?": "QuestionMark",
        }
    }

    /*
    specialKeyCodes () { 
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

        }
    }
    */

    keyForCode (aCode) {
        return this.codeToKeys()[aCode]
    }

    // -- events ---

    showCodeToKeys () {
        const c2k = this.keyCodesToNamesDict()

        //const s = JSON.stringify(c2k, null, 4)

        const lines = Object.keys(c2k).map((code) => {
            return "    " + code + ": \"" + this.codeToKeys()[code].name() + "\""
        })
        const s = "{\n" + lines.join(",\n") + "}\n"
        console.log("c2k:", s)

        /*
        console.log("Keyboard:")
        Object.keys(this.codeToKeys()).forEach((code) => {
            console.log("  code: ", code + " key name: ", this.codeToKeys()[code].name())
        })
        */
        return this
    }

    keyForEvent (event) {
        const code = event.keyCode
        const key = this.codeToKeys()[code]
        return key
    }

    onKeyDownCapture (event) {
        //console.log("event.metaKey = ", event.metaKey)
        
        const shouldPropogate = true
        const key = this.keyForEvent(event)

        if (key) {
            key.onKeyDown(event)

            if (this.isDebugging()) {
                this.debugLog(".onKeyDownCapture " + key.name())
            }
        } else {
            console.warn("Keyboard.shared() no key found for event ", event)
        }
            
        return shouldPropogate
    }

    onKeyUpCapture (event) {
        const shouldPropogate = true
        const key = this.keyForEvent(event)
        key.onKeyUp(event)

        if (this.isDebugging()) {
            this.debugLog(".onKeyUp " + key.name())
        }

        return shouldPropogate
    }
    
    // --- event handling method names ---

    downMethodNameForEvent (event) {
        return "on" + this.modsAndKeyNameForEvent(event) + "KeyDown"
    }

    upMethodNameForEvent (event) {
        return "on" + this.modsAndKeyNameForEvent(event) + "KeyUp"
    }

    eventIsAlphabetical (event) {
        const c = event.keyCode
        return c >= 65 && c <= 90
    }

    modsAndKeyNameForEvent (event) {
        // examples: AltB AltShiftB
        // Note that shift is explicit and the B key is always uppercase

        if (Type.isUndefined(event.keyCode)) {
            return ""
        }
        
        const key = this.keyForCode(event.keyCode)
        const isJustModifier = this.eventIsJustModifierKey(event)
        const modifiers = this.modifierNamesForEvent(event)
        const isAlpabetical = this.eventIsAlphabetical(event)
        let keyName = key ? key.name() : event.code

        
        if (isJustModifier) {
            return keyName
        }

        if (event.shiftKey) {
            // Note: if another modifier besides the shift key is down, 
            // the non-shift version of event.key is use e.g.
            // shift-equals is "Plus"
            // control-shift-equals is "ControlShiftEquals"
            // this follows the Javascript event.key convention

            const shiftName = this.shiftDict()[event.key]
            if (shiftName) {
                keyName = shiftName
            }
        }

        if (isAlpabetical) {
            keyName = "_" + keyName + "_"
            if (event.shiftKey) {
                keyName = keyName.capitalized()
                modifiers.remove("Shift")
            }
        }

        return modifiers.join("") + keyName
    }

    // --- special ---

    // get key helpers

    shiftKey () {
        return this.keyForName("Shift")
    }

    controlKey () {
        return this.keyForName("Control")
    }

    alternateKey () {
        return this.keyForName("Alternate")
    }

    leftCommandKey () {
        return this.keyForName("MetaLeft")
    }

    rightCommandKey () {
        return this.keyForName("MetaRight")
    }

    // get key state helpers

    shiftIsDown () {
        return this.shiftKey().isDown()
    }

    commandIsDown () {
        return this.leftCommandKey().isDown() || this.rightCommandKey().isDown()
    }


    equalsSignKey () {
        return this.keyForName("EqualsSign")
    }

    minusKey () {
        return this.keyForName("Dash")
    }

    plusKey () {
        return this.keyForName("Plus")
    }

    plusIsDown () {
        return this.plusKey().isDown()
    }

    currentlyDownKeys () {
        return Object.values(this.codeToKeys()).select(key => key.isDown())
    }

    currentlyUpKeys () {
        return Object.values(this.codeToKeys()).select(key => !key.isDown())
    }

    hasKeysDown () {
        return this.currentlyUpKeys().length !== 0
    }

    downKeyNames () {
        return Keyboard.shared().currentlyDownKeys().map(k => k.name())
    }

    show () {
        this.debugLog(" downKeys: ", this.downKeyNames())
    }

    allModifierNames () {
        return [
            "Alternate", 
            "Control", 
            "MetaLeft", 
            "MetaRight", 
            "Shift", 
        ]
    }

    modifierNamesForEvent (event) {
        let modifierNames = []

        // event names are ordered alphabetically to avoid ambiguity

        if (event.altKey) {
            modifierNames.push("Alternate")
        } 
        
        if (event.ctrlKey) {
            modifierNames.push("Control")
        }
        
        if (event.metaKey) {
            if (event.location === 1) {
                modifierNames.push("MetaLeft")
            } else {
                modifierNames.push("MetaRight")
            }
        } 
        
        if (event.shiftKey) {
            modifierNames.push("Shift")
        }

        return modifierNames
    }

    showEvent (event) {
        console.log("---")
        console.log("Keyboard.showEvent():")
        console.log("  code: ", event.keyCode)
        console.log("  name: ", Keyboard.shared().nameForKeyCode(event.keyCode))
        console.log("  is modifier: ", Keyboard.shared().eventIsJustModifierKey(event))
        console.log("  modifierNames: ", Keyboard.shared().modifierNamesForEvent(event))
        console.log("  modsAndKeyName: ", Keyboard.shared().modsAndKeyNameForEvent(event))
        console.log("---")
    }
    
}.initThisClass()
