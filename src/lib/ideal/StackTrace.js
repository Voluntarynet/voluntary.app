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
        let lines = error.stack.split("\n")
        let firstLine = lines.removeFirst()
        let out = []
        let indent = "    "
		
        lines.forEach(function (line) {
            if (line.contains("at file")) {
                out.push(["....", line.after("at ").split("/").pop()])
            } else {
                let line = line.after("at ")
                if (line == null) {
                    return;
                }
                let obj = line.before(".")
                let method = line.after(".").before(" (")
                let path = line.after("(").before(")")
                let filePart = path.split("/").pop()
                let file = filePart.before(":")
                if (file == null) { 
                    file = "???.js:??:?"
                }
                let className = file.before(".js")
                let location = filePart.after(":")
                out.push([className + " " + method + "()      ", file + ":" + location])
            }
        })
		
        let s = firstLine + "\n"
        let m = out.maxValue(function(entry) { return entry[0].length })
        out.forEach(function (entry) {
            s += indent + entry[0] + " ".repeat(m + 1 - entry[0].length) + entry[1] + "\n"
        })
		
        //s = error.message + "\n" + s
        s = s.replaceAll("<br>", "\n")
        return s
    }
	
    showError(error) {
        let s = this.stringForError(error)
        console.warn(s)

    }

    showCurrentStack() {
        let e = new Error()
        e.name = "STACK TRACE"
        e.message = ""
        console.log( e.stack );
    }
}

StackTrace.registerThisClass()


// --- helper functions ---

function assert(v) {
    if(v == false || v == null) {
        throw new Error("assert failed - false value")
    }
    return v
}

function assertDefined(v) {
    if(typeof(v) == "undefined") {
        throw new Error("assert failed - undefined value")
    }
    return v
}

Error.prototype.assert = function(v) {
    if(v == false || v == null) {
        throw new Error("assert failed - false value")
    }
    return v
}

Error.prototype.assertDefined = function(v) {
    if(typeof(v) == "undefined") {
        throw new Error("assert failed - undefined value")
    }
    return v
}

