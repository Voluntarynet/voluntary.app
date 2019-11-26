"use strict"

/*

    BMTextAreaField
    
*/

        
BMField.newSubclassNamed("BMTextAreaField").newSlots({
    isMono: false,
}).setSlots({
    init: function () {
        BMField.init.apply(this)
        this.setKeyIsVisible(false)
    },
    
}).initThisProto()
