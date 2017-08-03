
DivTransitions = ideal.Proto.extend().newSlots({
    type: "DivTransitions",
    properties: null,
	divView: null,
}).setSlots({
    init: function () {
		this.setProperties({})
        return this
    },

	at: function(aName) {
		var d = this.properties()
		if (!(name in d)) {
			d[name] = DivTransition.clone().setTransitions(this)
		}
		return v
	},

	propertiesAsList: function() {
		var d = this.properties()
		var parts = []
        for (var k in d) {
			if (d.hasOwnProperty(k)) {
				parts.push(d[k])
			}
		}
		return parts	
	},
	
	asString: function(aString) {
		return this.propertiesAsList().map((t) => { return t.asString() }).join(", ")
	},
	
	syncToDiv: function() {
		this.divView().setTransition(this.asString())
		return this
	},
	
	syncFromDiv: function() {
		this.setProperties({})

		var s = this.divView().transition()
		var transitionStrings = s.split(",")

		transitionStrings.forEach((tString) => {
			var t = DivTransition.clone().setFromString(tString)
			this.properties()[t.property()] = t
		})
		
		return this
	},
})
