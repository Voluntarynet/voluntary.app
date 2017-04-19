/*


*/

        
BMMultiFieldOption = BMNode.extend().newSlots({
    type: "BMMultiFieldOption",
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
		this.setViewClassName("BMMultiFieldOption")
    },
})
