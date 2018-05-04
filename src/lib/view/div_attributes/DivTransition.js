
"use strict"

window.DivTransition = ideal.Proto.extend().newSlots({
    type: "DivTransition",

    property: "",
    duration: 0, 
    timingFunction: "ease-in-ease-out",
    delay: 0, // set to number type (unit = seconds)

	//parent: null,
	transitions: null,
}).setSlots({
    init: function () {
        return this
    },

	durationString: function() {
		var v = this.duration()
		if (typeof(v) == "number") {
			return v + "s"
		}
		return v
	},
	
	delayString: function() {
		var v = this.duration()
		if (typeof(v) == "number") {
			return v + "s"
		}
		return v		
	},

	asString: function(aString) {
		var parts = [
			this.property(), 
			this.durationString(),
			this.timingFunction(),
			this.delayString(),
		]
		
		return parts.join(" ")
	},
	
	setFromString: function(aString) {
		var parts = aString.split(" ").select((part) => { return part != "" })
		
		var v = parts.removeFirst()
		assert(v != null)
		this.setProperty(v)
		
		v = parts.removeFirst()
		if (v != null) { 
			this.setDuration(v)
		}
		
		v = parts.removeFirst()
		if (v != null) { 
			this.setTimingFunction(v)
		}
		
		v = parts.removeFirst()
		if (v != null) { 
			this.setDelay(v)
		}
		
		return this
	},
	
	syncToDiv: function() {
		this.transitions().syncToDiv()
		return this
	},
})
