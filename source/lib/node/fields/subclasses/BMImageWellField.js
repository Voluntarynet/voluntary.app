"use strict"

/*

    BMImageWellField

*/
        
BMField.newSubclassNamed("BMImageWellField").newSlots({
    onlyShowsKeyWhenEmpty: false,
    isEditable: true,
}).setSlots({
    init: function () {
        BMField.init.apply(this)
        this.setKey("Image title")
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
        //this.addStoredSlot("imageDataURL") // stored in value
        this.addStoredSlot("nodeMinRowHeight")
        this.setNodeCanEditRowHeight(true)
    },

    /*
    setValue: function(v) {
        BMField.setValue.apply(this, [v])
        //console.log(this.typeId() + " setValue " + v)
        //this.updateKey()
        return this
    },
    */
})
