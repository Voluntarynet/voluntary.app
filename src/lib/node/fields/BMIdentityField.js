"use strict"

window.BMIdentityField = BMField.extend().newSlots({
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
	
	setValue: function(inValue) { // called by View on edit
	    //console.log("inValue = '" + inValue + "'")
	    var newValue = inValue.strip()
	    
        var parts = newValue.split(" ").concat(newValue.split("\n")).concat(newValue.split(","))
	    //console.log("parts = '", parts)
		var validPart = parts.detect((part) => { return bitcore.PublicKey.isValid(part) })
		if (validPart) {
			newValue = validPart
		}

        if (inValue != newValue) {
			setTimeout(() => { 
			    this.scheduleSyncToView() 
			}, 10)
        }
        
	    //console.log("newValue = '" + newValue + "'")
		BMField.setValue.apply(this, [newValue])
		
		return this
	},
	
	/*
	cleanedValue: function(v) {
		v = v.strip()
		var validPart = v.split(" ").detect((part) => { return bitcore.PublicKey.isValid(part) })
		if (validPart && validPart != v) {
			v = validPart
			BMField.setValue.apply(this, [v])
			setTimeout(() => { this.didUpdateNode() }, 10)
		}
		else {
			BMField.setValue.apply(this, [v])
		}	    
	},
	*/

})
