"use strict"

window.BMActionFieldRowView = BrowserRow.extend().newSlots({
    type: "BMActionFieldRowView",
    buttonView: null,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
		
		this.styles().unselected().setColor("#888")
		this.styles().unselected().setBackgroundColor("white")

		this.styles().selected().setColor("#888")
		this.styles().selected().setBackgroundColor("#eee")
		
		this.setButtonView(DivView.clone().setDivClassName("BMActionFieldButtonView"))
	    this.buttonView().setTarget(this).setAction("didClickButton")
        this.addSubview(this.buttonView())
        this.setMinHeight(64)
        return this
    },

    updateSubviews: function () {	
		BrowserRow.updateSubviews.apply(this)
		
        var bv = this.buttonView()
        bv.setInnerHTML(this.node().key())
        
		if (this.node().isEnabled()) {
			bv.setBackgroundColor("black").setColor("white").setOpacity(1)	
		} else {
			bv.setOpacity(0.5)	
		}

        this.applyStyles()
		
        return this
    },
    
    didClickButton: function() {
        if (this.node().isEnabled()) { // check in node field?
            this.node().doAction()
        }
        return this
    },
    
})
