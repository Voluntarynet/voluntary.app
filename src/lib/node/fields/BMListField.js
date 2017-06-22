/*


*/
        
BMListField = BMField.extend().newSlots({
    type: "BMListField",
	
}).setSlots({
    init: function () {
        BMField.init.apply(this)
		this.setViewClassName("BMListFieldView")
		this.setKeyIsEditable(false)
		this.setValueIsEditable(false)
    },


})
