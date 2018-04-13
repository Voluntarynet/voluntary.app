"use strict"

/*


*/
        
window.BMBoolField = BMField.extend().newSlots({
    type: "BMBoolField",
	unsetVisibleValue: "unset",
}).setSlots({
    init: function () {
        BMField.init.apply(this)
		this.setViewClassName("BMFieldRowView")
		this.setKeyIsEditable(false)
		this.setValueIsEditable(false)
		//this.setValue(false)
    },

	valueIsBool: function() {
		var b = this.value()
		return b == "true" || b == "false";
	},
	
	validate: function() {
		var isValid = this.valueIsBool()
		
		if (!isValid) {
			this.setValueError("this needs to be a boolean (true or false)")
		} else {
			this.setValueError(null)
		} 
		
		return isValid
	},
	
	normalizeThisValue: function(v) {
	    if (v === true || v == "t" || v == "true" | v == 1) { return true; }
	    return false
	},
	
	didUpdateNode: function() {
		this.validate()
		return BMField.didUpdateNode.apply(this)
	},
})
