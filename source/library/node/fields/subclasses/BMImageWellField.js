"use strict"

/*

    BMImageWellField

*/
        
window.BMImageWellField = class BMImageWellField extends BMField {
    
    initPrototype () {
        this.newSlots({
            onlyShowsKeyWhenEmpty: false,
            isEditable: true,
        })
    }

    init () {
        super.init()
        this.setKey("Image title")
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
        //this.addStoredSlot("imageDataURL") // stored in value
        this.addStoredSlot("nodeMinRowHeight")
        this.setNodeCanEditRowHeight(true)
    }

    /*
    setValue (v) {
        BMField.setValue.apply(this, [v])
        //this.debugLog(" setValue " + v)
        //this.updateKey()
        return this
    }
    */
   
}.initThisClass()
