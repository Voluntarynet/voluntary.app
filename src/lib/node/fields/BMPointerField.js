/*


*/
        
BMPointerField = BMField.extend().newSlots({
    type: "BMPointerField",
	
}).setSlots({
    init: function () {
        BMField.init.apply(this)
		this.setViewClassName("BMPointerFieldView")
		this.setKeyIsEditable(false)
		this.setValueIsEditable(false)
		this.setKeyIsVisible(true)
		this.setValueIsVisible(true)
		this.setNodeRowIsSelectable(true)
    },

	setValue: function(v) {
		console.warn("WARNING: BMPointerField setValue '" + v + "'")
		return this
	},

	title: function() {
		return this.value().title()
	},
	
	subtitle: function() {
		return this.value().subtitle()
	},
	
	note: function() {
		return this.value().note()
	},
	
	nodeRowLink: function() {
		return this.value()
	},

})
