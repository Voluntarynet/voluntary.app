"use strict"

/*

    BMStampField

*/

window.BMStampField = class BMStampField extends BMField {
    
    initPrototype () {

    }

    init () {
        super.init()
        this.setViewClassName("BMFieldRowView")
        //this.setKeyIsVisible(false)
        //this.setKey("drop images here")
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
    }
    
}.initThisClass()
