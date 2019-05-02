"use strict"

/*

    BMActionNode
    
    An abstraction of a UI visible action that can be performed on an object.
    the value is the action method name, the target is the field owner
*/
        
window.BMActionNode = BMNode.extend().newSlots({
    type: "BMActionNode",
    target: null,
    methodName: null,
    isEnabled: true,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setNodeRowIsSelectable(true)
    },
	
    doAction: function() {
	    const func = this.target()[this.methodName()]
	    
	    if (Type.isFunction(func)) {
	        func.apply(this.target())
	    } else {
            //this.setValueError("no method with this name")
            console.warn("no method with this name")
	    }
	    
	    return this
    },
})
