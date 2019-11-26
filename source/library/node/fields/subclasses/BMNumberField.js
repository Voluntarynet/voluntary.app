"use strict"

/*

    BMNumberField

    A named number field that validates that the 
    value is a number and shows an appropraite error message.

*/
        
BMField.newSubclassNamed("BMNumberField").newSlots({
    unsetVisibleValue: "unset",
}).setSlots({
    init: function () {
        BMField.init.apply(this)
        this.setViewClassName("BMFieldRowView")
        this.setKey("Number title")
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
        this.setValue(0)
    },

    valueIsNumeric: function() {
        const n = this.value()
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
	
    validate: function() {
        const isValid = this.valueIsNumeric()
		
        if (!isValid) {
            this.setValueError("This needs to be a number.")
        } else {
            this.setValueError(null)
        } 
		
        return isValid
    },
    
    /*
    didUpdateNode: function() {
        this.validate()
        return BMField.didUpdateNode.apply(this)
    },
    */
   
}).initThisProto()
