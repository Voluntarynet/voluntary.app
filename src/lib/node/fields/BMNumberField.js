"use strict"

/*

    BMNumberField

*/
        
window.BMNumberField = BMField.extend().newSlots({
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
        let n = this.value()
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
	
    validate: function() {
        let isValid = this.valueIsNumeric()
		
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
