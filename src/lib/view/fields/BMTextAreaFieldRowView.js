
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
		this.fillBottomOfColumnIfAvailable()
		return this
	},
	
	fillBottomOfColumnIfAvailable: function() {
		if (this.column().rows().last() == this) {
			console.log(this.type() + " update height")
			this.setMinAndMaxHeightPercentage(100)
			this.setFlexGrow(100)
			this.setBorderBottom("0px")
		} else {
			this.setFlexGrow(1)
			this.setBorderBottom("1px solid #aaa")
		}
		return this
	},
})
