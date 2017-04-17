/*


*/
        
BMImageWellField = BMField.extend().newSlots({
    type: "BMImageWellField",
	
}).setSlots({
    init: function () {
        BMField.init.apply(this)
		//this.setViewClassName("BMImageWellFieldView")
		//this.setKeyIsVisible(false)
		//this.setKey("drop images here")
		this.setKeyIsEditable(false)
		this.setValueIsEditable(false)
    },
})
