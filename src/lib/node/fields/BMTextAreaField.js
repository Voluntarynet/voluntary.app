/*


*/

        
BMTextAreaField = BMField.extend().newSlots({
    type: "BMTextAreaField",
}).setSlots({
    init: function () {
        BMField.init.apply(this)
		//this.setViewClassName("BMTextAreaFieldRowView")
		this.setKeyIsVisible(false)
    },
})
