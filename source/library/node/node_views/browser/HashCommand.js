"use strict"

/*
    
    HashCommand

    Work in progress.
    
*/

window.HashCommand = class HashCommand extends ProtoClass {
    
    initPrototype () {
        this.newSlot("target", null)
        this.newSlot("method", null)
        this.newSlot("arguments", [])
    }

    init () {
        super.init()
        return this
    }

    clear () {
        this.setMethod(null)
        this.setArguments(null)
        return this
    }

    parseCommandString (s) {
        let j = []
        try {
            j = JSON.parse(s)
        } catch (e) {
            return this
        }

        console.log("parseCommandString:", j)
        if (!j) {
            this.clear()
            return this
        }

        let m = j[0]
        let a = j[1]

        return this
    }

    setArgsString (s) {
        this.setArguments(JSON.parse(s))
        return this
    }

    getArgsString () {
        return JSON.stringify(this.arguments())
    }

    asCommandString () {
        if (this.method()) {
            let argsString = JSON.stringify(this.arguments())
            return this.method() + "(" + this.argumentStrings().join(",") + ")"

        }
        return null
    }

    send () {
        /*
        let t = this.target()
        let m = this.method()

        if (t && m) {
            if (t.acceptsHashCommand(m)) {
                t[m].apply(this.arguments())
            }
        }
        */
    }
    
}.initThisClass()
