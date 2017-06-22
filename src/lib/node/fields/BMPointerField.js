/*


*/
        
BMPointerField = BMField.extend().newSlots({
    type: "BMPointerField",
	
}).setSlots({
    init: function () {
        BMField.init.apply(this)
		this.setViewClassName("BMPointerFieldView")
		this.setKeyIsEditable(false)
		this.setValueIsEditable(false)
    },

	setValue: function(v) {
		console.log("BMPointerField setValue '" + v + "'")

		
		return this
	},

})
