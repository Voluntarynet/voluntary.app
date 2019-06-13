"use strict"

/*
    
    StackTrace
    
    Class that can parse a JS stack trace, into StackFrame objects.


*/

class StackFrame extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            functionName: null,
            filePath: null,
            line: null,
            character: null,
        })
    }
}

class StackTrace extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            error: null,
            stackFrames: [],
        })
    }
	
    setError(error) {
        const lines = error.stack.split("\n")
        const firstLine = lines.removeFirst()
        const out = []
        const indent = "    "
		
        lines.forEach(function (line) {
            if (line.contains("at file")) {
                out.push(["....", line.after("at ").split("/").pop()])
            } else {
                line = line.after("at ")
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

}

StackTrace.registerThisClass()






//console.log("Currently running script:", Error.callingScriptURL())
