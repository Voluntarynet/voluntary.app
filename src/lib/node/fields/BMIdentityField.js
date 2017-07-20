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
	
	setValue: function(v) { // called by View on edit
		/*
		v = v.strip()
		var validPart = v.split(" ").detect((part) => { return bitcore.PublicKey.isValid(part) })
		if (validPart && validPart != v) {
			v = validPart
			BMField.setValue.apply(this, [v])
			setTimeout(() => { this.didUpdate() }, 10)
		}
		else {
			BMField.setValue.apply(this, [v])
		}
		*/
		BMField.setValue.apply(this, [v])
		return this
	},

})
