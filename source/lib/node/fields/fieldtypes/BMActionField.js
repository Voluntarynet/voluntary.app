"use strict"

/*

    BMActionField
    
    An abstraction of a UI visibleaction that can be performed on an object.
    the value is the action method name, the target is the field owner
*/
        
window.BMActionField = BMField.extend().newSlots({
    type: "BMActionField",
}).setSlots({
    init: function () {
        BMField.init.apply(this)
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
        //this.setKeyIsVisible(false)
        this.setValueIsVisible(true)
        this.setNodeRowIsSelectable(true)
    },
    
    setValue: function(v) {
        return this
    },

    title: function() {
        return this.value()
    },
	
    /*
	subtitle: function() {
		return null
	},
	
	note: function() {
		return null
	},
	*/
	
    doAction: function() {
	    const func = this.target()[this.value()]
	    
	    if (Type.isFunction(func)) {
	        func.apply(this.target())
	    } else {
	        this.setValueError("no method with this name")
	    }
	    
	    return this
    },
})
