/*


*/

        
BMTextAreaField = BMField.extend().newSlots({
    type: "BMTextAreaField",
}).setSlots({
    init: function () {
        BMField.init.apply(this)
		//this.setViewClassName("BMTextAreaFieldView")
		//this.valueDivClassName("BMTextAreaValueFieldView")
		this.setKeyIsVisible(false)
    },
})
