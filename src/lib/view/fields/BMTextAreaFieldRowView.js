"use strict"

window.BMTextAreaFieldRowView = BMFieldRowView.extend().newSlots({
    type: "BMTextAreaFieldRowView",
}).setSlots({
    init: function () {
        BMFieldRowView.init.apply(this)
		this.keyView().setDisplay("none")
		//this.valueView().setDivClassName("BMTextAreaFieldValueView")
        return this
    },

	createValueView: function() {
		return NodeView.clone().setDivClassName("BMTextAreaFieldValueView NodeView DivView")
	},
	
    updateSubviews: function() {   
	    BMFieldRowView.updateSubviews.apply(this)
		this.fillBottomOfColumnIfAvailable()
		
		if (this.node().isMono()) {
			this.valueView().setDivClassName("BMMonoTextAreaFieldValueView NodeView DivView")
			this.valueView().set
		} else {
			this.valueView().setDivClassName("BMTextAreaFieldValueView NodeView DivView")
		}
		
		return this
	},
	
	fillBottomOfColumnIfAvailable: function() {
		if (this.column().rows().last() == this) {
			//console.log(this.type() + " update height")
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
