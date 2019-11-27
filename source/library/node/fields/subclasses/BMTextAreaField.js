"use strict"

/*

    BMTextAreaField
    
*/

window.BMTextAreaField = class BMTextAreaField extends BMField {
    
    initPrototype () {
        this.newSlots({
            isMono: false,
        })
    }

    init () {
        super.init()
        this.setKeyIsVisible(false)
    }
    
}.initThisClass()
