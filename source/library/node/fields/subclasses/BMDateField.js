"use strict"

/*

    BMDateField

*/

window.BMDateField = class BMDateField extends BMField {
    
    initPrototype () {
        this.newSlot("unsetVisibleValue", "unset")
    }

    init () {
        super.init()
        this.setViewClassName("BMFieldRowView")
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
    }

    visibleValue () {
        const v = this.value()
        if (!v) { 
            return this.unsetVisibleValue()
        }
        return new Date(v).toDateString()
    }
    
}.initThisClass()
