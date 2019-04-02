"use strict"

/*

    BMTextAreaField
    
*/

        
window.BMTextAreaField = BMField.extend().newSlots({
    type: "BMTextAreaField",
    isMono: false,
}).setSlots({
    init: function () {
        BMField.init.apply(this)
        this.setKeyIsVisible(false)
    },
})
