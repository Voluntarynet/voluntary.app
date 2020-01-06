"use strict"
      
/*

    BMBooleanField

    
*/

window.BMBooleanField = class BMBooleanField extends BMField {
    
    initPrototype () {
        this.newSlot("unsetVisibleValue", "unset")
    }

    init () {
        super.init()
        this.setViewClassName("BMFieldRowView")
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
        //this.setValue(false)
    }

    valueIsBool () {
        const b = this.value()
        return Type.isBoolean(b);
    }
	
    validate () {
        const isValid = this.valueIsBool()
		
        if (!isValid) {
            this.setValueError("This needs to be a boolean (true or false).")
        } else {
            this.setValueError(null)
        } 
		
        return isValid
    }
	
    normalizeThisValue (v) {
	    if (v === true || v === "t" || v === "true" | v === 1) { return true; }
	    return false
    }
	
    didUpdateNode () {
        this.validate()
        return super.didUpdateNode()
    }

}.initThisClass()
