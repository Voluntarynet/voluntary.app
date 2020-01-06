"use strict"

/*

    BMImageWellField

*/
        
window.BMImageWellField = class BMImageWellField extends BMField {
    
    initPrototype () {
        this.newSlot("onlyShowsKeyWhenEmpty", false)
        this.newSlot("isEditable", true)
        
        this.protoAddStoredSlot("nodeMinRowHeight")

        this.setKey("Image title")
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
        //this.protoAddStoredSlot("imageDataURL") // stored in value
        this.setNodeCanEditRowHeight(true)
    }

    init () {
        super.init()
    }

    /*
    setValue (v) {
        super.setValue(v)
        //this.debugLog(" setValue " + v)
        //this.updateKey()
        return this
    }
    */
   
}.initThisClass()
