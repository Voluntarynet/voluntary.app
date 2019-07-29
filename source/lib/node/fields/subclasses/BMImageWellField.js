"use strict"

/*

    BMImageWellField

*/
        
BMField.newSubclassNamed("BMImageWellField").newSlots({
    onlyShowsKeyWhenEmpty: true,
    maxImageCount: 1,
    isEditable: true,
}).setSlots({
    init: function () {
        BMField.init.apply(this)
        this.setKey("Images")
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
        //this.addStoredSlot("imageDataURLs")
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
