
BMTextAreaFieldRowView = BMFieldRowView.extend().newSlots({
    type: "BMTextAreaFieldRowView",
}).setSlots({
    init: function () {
        BMFieldRowView.init.apply(this)
		this.keyView().setDisplay("none")
		//this.valueView().setDivClassName("BMTextAreaFieldValueView")
        return this
    },

	createValueView: function() {
		return NodeView.clone().setDivClassName("BMTextAreaFieldValueView")
	},
	
    updateSubviews: function() {   
	    BMFieldRowView.updateSubviews.apply(this)
		if (this.column().rows().last() == this) {
			console.log(this.type() + " update height")
			//this.setHeightPercentage(100)
			this._element.style.minHeight = "100%"
			this._element.style.maxHeight = "100%"
		}
	},
})
