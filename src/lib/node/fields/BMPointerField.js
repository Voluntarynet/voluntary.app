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
		console.log("BMPointerField setValue '" + v + "'")
		
		return this
	},

	nodeRowLink: function() {
		return this.value()
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
})
