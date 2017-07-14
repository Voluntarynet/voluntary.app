/*


*/
        
BMNumberField = BMField.extend().newSlots({
    type: "BMNumberField",
	unsetVisibleValue: "unset",
}).setSlots({
    init: function () {
        BMField.init.apply(this)
		this.setViewClassName("BMFieldRowView")
		this.setKeyIsEditable(false)
		this.setValueIsEditable(false)
    },

	valueIsNumeric: function() {
		var n = this.value()
		return !isNaN(parseFloat(n)) && isFinite(n);
	},
	
	validate: function() {
		var isValid = this.valueIsNumeric()
		
		if (!isValid) {
			this.setValueError("this needs to be a number")
		} else {
			this.setValueError(null)
		} 
		
		return isValid
	},
	
	didUpdate: function() {
		this.validate()
		return BMField.didUpdate.apply(this)
	},
})
