"use strict"

/*

    BMIdentityField

*/

window.BMIdentityField = class BMIdentityField extends BMField {
    
    initPrototype () {

    }

    init () {
        super.init()
        //this.setViewClassName("BMFieldRowView")
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
    }

    validate () {
        if (!bitcore.PublicKey.isValid(this.value())) {
            this.setValueError("invalid address")
        } else {
            this.setValueError(null)
        }
    }
	
    setValue (inValue) { // called by View on edit
        if (Type.isNull(inValue)) {
            console.log("WARNING: " + this.type() + " setValue(null)")
            return this
        }
	    //console.log("inValue = '" + inValue + "'")
	    let newValue = inValue.strip()
	    
        const parts = newValue.split(" ").concat(newValue.split("\n")).concat(newValue.split(","))
	    //console.log("parts = '", parts)
        const validPart = parts.detect((part) => { return bitcore.PublicKey.isValid(part) })

        if (validPart) {
            newValue = validPart
        }

        if (inValue !== newValue) {
            this.scheduleSyncToView() 
        }
        
        //console.log("newValue = '" + newValue + "'")
        super.setValue(newValue)
		
        return this
    }

}.initThisClass()
