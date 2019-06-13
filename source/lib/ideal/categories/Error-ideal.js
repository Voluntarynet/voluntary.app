"use strict"

/*

    Error-ideal

    Some extra methods for the Javascript Error primitive.

*/

Error.assert = function(v) {
    if(!Boolean(v)) {
        throw new Error("assert failed - false value")
    }
    return v
}

Error.assertDefined = function(v) {
    if(v === undefined) {
        throw new Error("assert failed - undefined value")
    }
    return v
}

Error.showCurrentStack = function() {
    const e = new Error()
    e.name = "STACK TRACE"
    e.message = ""
    console.log( e.stack );
}


Error.try = function(func) {
    try {
        func()
    } catch (error) {
        this.showError(error)
    }
}

Error.callingScriptURL = function() {
    const urls = new Error().stackURLs()
    return urls[1]
}


Object.shallowCopyTo({

    // --- assert ---

    /*
    assert: function(v) {
        if(!Boolean(v)) {
            throw new Error("assert failed - false value")
        }
        return v
    },
    
    assertDefined: function(v) {
        if(v === undefined) {
            throw new Error("assert failed - undefined value")
        }
        return v
    },
    */

    // --- assert ---
    
    stackURLs: function(v) {
        let urls = this.stack.split("at")
        urls.removeFirst()
        urls = urls.map(url => {
            
            if (url.contains("(")) {
                url = url.after("(")
            }
    
            url = url.strip()
    
            const parts = url.split(":")
            parts.removeLast()
            parts.removeLast()
            return parts.join(":")
        })
        return urls
    },

    // ------------------------

    description: function() {
        const error = this
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
    },
	
    show: function() {
        console.warn(this.description())
    },


    
}, Error.prototype);

// --- helper functions ---

function assert(v) {
    return Error.assert(v)
}

function assertDefined(v) {
    return Error.assertDefined(v)
}