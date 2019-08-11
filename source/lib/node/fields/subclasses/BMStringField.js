"use strict"

/*

    BMStringField

*/
        
BMField.newSubclassNamed("BMStringField").newSlots({
    unsetVisibleValue: "",
}).setSlots({
    init: function () {
        BMField.init.apply(this)
        this.setViewClassName("BMFieldRowView")
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
    },
})
