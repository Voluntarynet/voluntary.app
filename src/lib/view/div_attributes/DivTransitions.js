/*
-     transition: width 2s linear 1s, height 2s ease 1s; 1st time is duration, 2nd time is delay
*/

"use strict"

window.DivTransitions = ideal.Proto.extend().newSlots({
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
        return d[name]
    },

    propertiesAsList: function() {
        return Object.values(this.properties())	
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
