"use strict"

/*

    BMDateField

*/
        
window.BMDateField = BMField.extend().newSlots({
    type: "BMDateField",
    unsetVisibleValue: "unset",
}).setSlots({
    init: function () {
        BMField.init.apply(this)
        this.setViewClassName("BMFieldRowView")
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
    },

    visibleValue: function() {
        let  v = this.value()
        if (!v) { 
            return this.unsetVisibleValue()
        }
        return new Date(v).toDateString()
    },
})
