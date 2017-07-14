
BMTextAreaFieldRowView = BMFieldRowView.extend().newSlots({
    type: "BMTextAreaFieldRowView",
}).setSlots({
    init: function () {
        BMFieldRowView.init.apply(this)
        this.setDivClassName("BMTextAreaFieldRowView")
		this.keyView().setDisplay("none")
		//this.valueView().setDivClassName("BMTextAreaFieldValueView")
        return this
    },

	createValueView: function() {
		return NodeView.clone().setDivClassName("BMTextAreaFieldValueView")
	},
})
