
BMMultiFieldView = BMFieldView.extend().newSlots({
    type: "BMMultiFieldView",
}).setSlots({
    init: function () {
        BMFieldView.init.apply(this)
        this.setDivClassName("BMFieldView")
        //this.setDivClassName("BMMultiFieldView")
		//this.keyView().setDisplay("none")
		//this.valueView().setDivClassName("BMTextAreaFieldValueView")
		//this.valueView().setDivClassName("BMMultiFieldValueView")
        return this
    },

	setNode: function(aNode) {
		BMFieldView.setNode.apply(this, [aNode])
		this.valueView().setNode(aNode)
		return this
	},

	createValueView: function() {
		return BMMultiFieldValueView.clone()
	},
})
