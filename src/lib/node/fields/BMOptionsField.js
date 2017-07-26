/*


*/

BMOptionsField = BMField.extend().newSlots({
    type: "BMOptionsField",
	validValues: [],
	options: [],
	validValuesMethod: null,
}).setSlots({
    init: function () {
        BMField.init.apply(this)
		//this.setViewClassName("BMOptionsFieldView")
    },

	setValidValues: function(v) {
		this._validValues = v
		
		if (this.value() == null && v.length) {
			this.setValue(v[0])
		}

		return this
	},
	
	validValues: function() {
		if (this._validValues.length == 0 && this.validValuesMethod()) {
			var t = this.target()
			return t[this.validValuesMethod()].apply(t)
		}
		
		return this._validValues
	},
	
	validate: function() {
		//console.log(this.type() + " validate")
		 
		if(!this.validValues().contains(this.value())) {	
			this.setValueError("invalid value")
			return false
		}
		this.setValueError(null)
		return true
	},
	
})
