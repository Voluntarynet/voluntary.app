/*


*/
        
BMIdentityField = BMField.extend().newSlots({
    type: "BMIdentityField",
	
}).setSlots({
    init: function () {
        BMField.init.apply(this)
		//this.setViewClassName("BMFieldRowView")
		this.setKeyIsEditable(false)
		this.setValueIsEditable(false)
    },

	validate: function() {
		if (!bitcore.PublicKey.isValid(this.value())) {
			this.setValueError("invalid address")
		} else {
			this.setValueError(null)
		}
	},

})
