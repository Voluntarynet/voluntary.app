"use strict"

/*

    BMIdentityField

*/

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
	    let newValue = inValue.strip()
	    
        let parts = newValue.split(" ").concat(newValue.split("\n")).concat(newValue.split(","))
	    //console.log("parts = '", parts)
        let validPart = parts.detect((part) => { return bitcore.PublicKey.isValid(part) })
        if (validPart) {
            newValue = validPart
        }

        if (inValue !== newValue) {
            this.scheduleSyncToView() 
        }
        
	    //console.log("newValue = '" + newValue + "'")
        BMField.setValue.apply(this, [newValue])
		
        return this
    },

})
