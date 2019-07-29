"use strict"

/*

    BMNumberField

*/
        
BMField.newSubclassNamed("BMNumberField").newSlots({
    unsetVisibleValue: "unset",
}).setSlots({
    init: function () {
        BMField.init.apply(this)
        this.setViewClassName("BMFieldRowView")
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
    },

    valueIsNumeric: function() {
        const n = this.value()
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
	
    validate: function() {
        const isValid = this.valueIsNumeric()
		
        if (!isValid) {
            this.setValueError("this needs to be a number")
        } else {
            this.setValueError(null)
        } 
		
        return isValid
    },
	
    didUpdateNode: function() {
        this.validate()
        return BMField.didUpdateNode.apply(this)
    },
})
