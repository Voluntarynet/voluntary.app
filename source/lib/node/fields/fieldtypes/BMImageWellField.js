"use strict"

/*

    BMImageWellField

*/
        
window.BMImageWellField = BMField.extend().newSlots({
    type: "BMImageWellField",
    onlyShowsKeyWhenEmpty: true,
    maxImageCount: 1,
    isEditable: true,
}).setSlots({
    init: function () {
        BMField.init.apply(this)
        //this.setViewClassName("BMImageWellFieldView")
        //this.setKeyIsVisible(false)
        this.setKey("drop images here")
        this.setKeyIsEditable(false)
        this.setValueIsEditable(false)
        //this.addStoredSlot("imageDataURLs")

    },

    setValue: function(v) {
        BMField.setValue.apply(this, [v])
        //console.log(this.typeId() + " setValue " + v)
        //this.updateKey()
        return this
    },
	
    /*
	updateKey: function() {
		if (this.value().length === 0) {
			this.setKey("drop images here")
		} else {
			this.setKey("")
		}
		this.scheduleSyncToView() 
		return this
	},
	*/
})
