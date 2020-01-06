"use strict"

/*
    
    StackTrace
    
    Class that can parse a JS stack trace, into StackFrame objects.


*/

window.StackFrame = class StackFrame extends ProtoClass {
    initPrototype () {
        this.newSlot("functionName", null)
        this.newSlot("url", null)
        this.newSlot("lineNumber", null)
        this.newSlot("characterNumber", null)
    }

    init() {
        super.init()
    }

    fromLine(line) {
        line = line.after("at ")

        if (line.contains("(")) {
            const functionName = line.before("(").strip()
            this.setFunctionName(functionName)
            line = line.between("(", ")").strip()
        }
        
        const parts = line.split(":")
        if (parts.length !== 4) {
            console.log("unexpected stacktrace line format: '" + line + "'")
            return this
        }
        const lineNumber = parts.removeLast()
        this.setLineNumber(Number(lineNumber))

        const characterNumber = parts.removeLast()
        this.setCharacterNumber(Number(characterNumber))

        const url = parts.join(":")
        this.setUrl(url)

        return this
    }

    description() {
        return "  " + this.functionName() + "() line " + this.lineNumber()
    }

    show() {
        console.log(this.description())
    }
}.initThisClass() 


// -----------------------------------------------------------------

window.StackTrace = class StackTrace extends ProtoClass {
    initPrototype () {
        this.newSlot("error", null)
        this.newSlot("stackFrames", [])
    }

    init() {
        super.init()
    }
	
    setError(error) {
        this._error = error

        const lines = error.stack.split("\n")
        const firstLine = lines.removeFirst()
		
        const frames = lines.map((line) => {
            return StackFrame.clone().fromLine(line)
        })
        this.setStackFrames(frames)

        return this
    }

    show() {
        console.log(this.type() + ": '" + this.error().message + "'")
        this.stackFrames().forEach(frame => frame.show())
    }

    test() {
        const f1 = function() {
            try {
                throw(new Error("test error"))
            } catch(e) {
                StackTrace.clone().setError(e).show()
            }
        }
        
        const f2 = function() { f1() }
        const f3 = function() { f2() }
        f3()        
    }

}.initThisClass() 

//StackTrace.clone().test()
//console.log("Currently running script:", Error.callingScriptURL())
