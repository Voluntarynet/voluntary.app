"use strict"

/*
    StackTrace
    A stack printout that understands objects.
*/

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
})


/*
StackTrace.try(function() {	
	iejije
})
*/