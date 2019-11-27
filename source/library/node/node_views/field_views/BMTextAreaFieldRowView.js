"use strict"

/*

    BMTextAreaFieldRowView

*/

window.BMTextAreaFieldRowView = class BMTextAreaFieldRowView extends BMFieldRowView {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()
        this.keyView().setDisplay("none")
        //this.valueView().setDivClassName("BMTextAreaFieldValueView")
        return this
    }

    createValueView () {
        return NodeView.clone().setDivClassName("BMTextAreaFieldValueView NodeView DomView")
    }
	
    updateSubviews () {   
	    BMFieldRowView.updateSubviews.apply(this)
        this.fillBottomOfColumnIfAvailable()
		
        if (this.node().isMono()) {
            this.valueView().setDivClassName("BMMonoTextAreaFieldValueView NodeView DomView")
            this.valueView().set
        } else {
            this.valueView().setDivClassName("BMTextAreaFieldValueView NodeView DomView")
        }
		
        return this
    }
	
    fillBottomOfColumnIfAvailable () {
        if (this.column().rows().last() === this) {
            //this.debugLog(" update height")
            this.setMinAndMaxHeightPercentage(100)
            this.setFlexGrow(100)
            this.setBorderBottom("0px")
        } else {
            this.setFlexGrow(1)
            this.setBorderBottom("1px solid #aaa")
        }
        return this
    }
    
}.initThisClass()
