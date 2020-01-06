"use strict"

/*

    BMTextAreaField
    
*/

window.BMTextAreaField = class BMTextAreaField extends BMField {
    
    initPrototype () {
        this.newSlot("isMono", false)
    }

    init () {
        super.init()
        this.setKeyIsVisible(false)
    }
    
}.initThisClass()
