"use strict"

/*

    BMTextAreaFieldRowView

*/


BMFieldRowView.newSubclassNamed("BMTextAreaFieldRowView").newSlots({
}).setSlots({
    init: function () {
        BMFieldRowView.init.apply(this)
        this.keyView().setDisplay("none")
        //this.valueView().setDivClassName("BMTextAreaFieldValueView")
        return this
    },

    createValueView: function() {
        return NodeView.clone().setDivClassName("BMTextAreaFieldValueView NodeView DomView")
    },
	
    updateSubviews: function() {   
	    BMFieldRowView.updateSubviews.apply(this)
        this.fillBottomOfColumnIfAvailable()
		
        if (this.node().isMono()) {
            this.valueView().setDivClassName("BMMonoTextAreaFieldValueView NodeView DomView")
            this.valueView().set
        } else {
            this.valueView().setDivClassName("BMTextAreaFieldValueView NodeView DomView")
        }
		
        return this
    },
	
    fillBottomOfColumnIfAvailable: function() {
        if (this.column().rows().last() === this) {
            //console.log(this.typeId() + " update height")
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
