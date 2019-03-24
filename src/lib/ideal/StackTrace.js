"use strict"

/*
    
    StackTrace
    
    A stack printout that understands objects.

    Example uses:

        showing a caught error:

            try {
                ...
            } catch(e) {
                StackTrace.shared().showError(e)
            }

        try and catch:

            StackTrace.shared().try(() => {	 ... })

        show the current stack:

            StackTrace.shared().showCurrentStack()

*/

class StackTrace extends ProtoClass {
    init() {
        super.init()
        this.newSlots({

        })
    }

    try(func) {
        try {
            func()
        } catch (error) {
            this.showError(error)
        }
    }
	
    stringForError(error) {
        const lines = error.stack.split("\n")
        const firstLine = lines.removeFirst()
        const out = []
        const indent = "    "
		
        lines.forEach(function (line) {
            if (line.contains("at file")) {
                out.push(["....", line.after("at ").split("/").pop()])
            } else {
                const line = line.after("at ")
                if (line === "") {
                    return;
                }
                const obj = line.before(".")
                const method = line.after(".").before(" (")
                const path = line.after("(").before(")")
                const filePart = path.split("/").pop()
                let file = filePart.before(":")
                if (file === "") { 
                    file = "???.js:??:?"
                }
                const className = file.before(".js")
                const location = filePart.after(":")
                out.push([className + " " + method + "()      ", file + ":" + location])
            }
        })
		
        let s = firstLine + "\n"
        const m = out.maxValue(function(entry) { return entry[0].length })
        out.forEach(function (entry) {
            s += indent + entry[0] + " ".repeat(m + 1 - entry[0].length) + entry[1] + "\n"
        })
		
        //s = error.message + "\n" + s
        s = s.replaceAll("<br>", "\n")
        return s
    }
	
    showError(error) {
        const s = this.stringForError(error)
        console.warn(s)
    }

    showCurrentStack() {
        const e = new Error()
        e.name = "STACK TRACE"
        e.message = ""
        console.log( e.stack );
    }
}

StackTrace.registerThisClass()


// --- helper functions ---

function assert(v) {
    if(!Boolean(v)) {
        throw new Error("assert failed - false value")
    }
    return v
}

function assertDefined(v) {
    if(v === undefined) {
        throw new Error("assert failed - undefined value")
    }
    return v
}

Error.prototype.assert = function(v) {
    if(!Boolean(v)) {
        throw new Error("assert failed - false value")
    }
    return v
}

Error.prototype.assertDefined = function(v) {
    if(v === undefined) {
        throw new Error("assert failed - undefined value")
    }
    return v
}

