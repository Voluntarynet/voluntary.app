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

        this.setKeyIsVisible(true)
        this.setKeyIsEditable(true)

        this.setValueIsVisible(true)
        this.setValueIsEditable(true)
    },
})
