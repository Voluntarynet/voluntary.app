/*


*/
        
BMStampField = BMField.extend().newSlots({
    type: "BMStampField",
	
}).setSlots({
    init: function () {
        BMField.init.apply(this)
		this.setViewClassName("BMFieldRowView")
		//this.setKeyIsVisible(false)
		//this.setKey("drop images here")
		this.setKeyIsEditable(false)
		this.setValueIsEditable(false)
    },
})
