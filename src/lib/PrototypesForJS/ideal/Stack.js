/*
    Stack
    A stack printout that understands objects.
*/

Stack = ideal.Proto.extend().newSlots({
    type: "Stack",
 
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
	
	showError: function(error) {
		var lines = error.stack.split("\n")
		var firstLine = lines.removeFirst()
		var out = []
		var indent = "    "
		
		lines.forEach(function (line) {
				if (line.contains("at file")) {
					out.push(["....", line.after("at ").split("/").pop()])
				} else {
					var line = line.after("at ")
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
		console.warn(s)

//		console.log(error.stack)
	},
})


/*
Stack.try(function() {	
	iejije
})
*/