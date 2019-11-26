"use strict"

/*
    
    HashCommand

    Work in progress.
    
*/

ideal.Proto.newSubclassNamed("HashCommand").newSlots({
    target: null,
    method: null,
    arguments: [],
}).setSlots({
    clear: function() {
        this.setMethod(null)
        this.setArguments(null)
        return this
    },

    parseCommandString: function(s) {
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
    },

    setArgsString: function(s) {
        this.setArguments(JSON.parse(s))
        return this
    },

    getArgsString: function() {
        return JSON.stringify(this.arguments())
    },

    asCommandString: function() {
        if (this.method()) {
            let argsString = JSON.stringify(this.arguments())
            return this.method() + "(" + this.argumentStrings().join(",") + ")"

        }
        return null
    },

    send: function() {
        /*
        let t = this.target()
        let m = this.method()

        if (t && m) {
            if (t.acceptsHashCommand(m)) {
                t[m].apply(this.arguments())
            }
        }
        */
    },
    
}).initThisProto()
