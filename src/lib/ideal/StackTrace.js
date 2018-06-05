"use strict"

/*
    StackTrace
    A stack printout that understands objects.

    example uses:

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
        var lines = error.stack.split("\n")
        var firstLine = lines.removeFirst()
        var out = []
        var indent = "    "
		
        lines.forEach(function (line) {
            if (line.contains("at file")) {
                out.push(["....", line.after("at ").split("/").pop()])
            } else {
                var line = line.after("at ")
                if (line == null) {
                    return;
                }
                var obj = line.before(".")
                var method = line.after(".").before(" (")
                var path = line.after("(").before(")")
                var filePart = path.split("/").pop()
                var file = filePart.before(":")
                if (file == null) { 
                    file = "???.js:??:?"
                }
                var className = file.before(".js")
                var location = filePart.after(":")
                out.push([className + " " + method + "()      ", file + ":" + location])
            }
        })
		
        var s = firstLine + "\n"
        var m = out.maxValue(function(entry) { return entry[0].length })
        out.forEach(function (entry) {
            s += indent + entry[0] + " ".repeat(m + 1 - entry[0].length) + entry[1] + "\n"
        })
		
        //s = error.message + "\n" + s
        s = s.replaceAll("<br>", "\n")
        return s
    }
	
    showError(error) {
        var s = this.stringForError(error)
        console.warn(s)

    }

    showCurrentStack() {
        var e = new Error()
        e.name = "STACK TRACE"
        e.message = ""
        console.log( e.stack );
    }
}

/*
window.StackTrace = ideal.Proto.extend().newSlots({
    type: "StackTrace",
}).setSlots({
    init: function () {
    },

    try: function(func) {
        try {
            func()
        } catch (error) {
            this.showError(error)
        }
    },
	
    stringForError: function(error) {
        var lines = error.stack.split("\n")
        var firstLine = lines.removeFirst()
        var out = []
        var indent = "    "
		
        lines.forEach(function (line) {
            if (line.contains("at file")) {
                out.push(["....", line.after("at ").split("/").pop()])
            } else {
                var line = line.after("at ")
                if (line == null) {
                    return;
                }
                var obj = line.before(".")
                var method = line.after(".").before(" (")
                var path = line.after("(").before(")")
                var filePart = path.split("/").pop()
                var file = filePart.before(":")
                if (file == null) { 
                    file = "???.js:??:?"
                }
                var className = file.before(".js")
                var location = filePart.after(":")
                out.push([className + " " + method + "()      ", file + ":" + location])
            }
        })
		
        var s = firstLine + "\n"
        var m = out.maxValue(function(entry) { return entry[0].length })
        out.forEach(function (entry) {
            s += indent + entry[0] + " ".repeat(m + 1 - entry[0].length) + entry[1] + "\n"
        })
		
        //s = error.message + "\n" + s
        s = s.replaceAll("<br>", "\n")
        return s
    },
	
    showError: function(error) {
        var s = this.stringForError(error)
        console.warn(s)

    },

    showCurrentStack: function() {
        var e = new Error()
        e.name = "STACK TRACE"
        e.message = ""
        console.log( e.stack );
    },
})
*/

/*
StackTrace.try(function() {	
	iejije
})
*/

// Extra

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