"use strict"

/*

    BMActionNodeRowView

*/

BrowserRow.newSubclassNamed("BMActionNodeRowView").newSlots({
    buttonView: null,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
		
        this.styles().unselected().setColor("#888")
        this.styles().unselected().setBackgroundColor("white")

        this.styles().selected().setColor("#888")
        this.styles().selected().setBackgroundColor("#eee")
		
        this.setButtonView(ButtonView.clone().setDivClassName("BMActionNodeView"))
	    this.buttonView().setTarget(this).setAction("didClickButton")
	    this.buttonView().setTransition("all 0.3s")

        this.addContentSubview(this.buttonView())
        this.setMinHeightPx(64)
        return this
    },

    updateSubviews: function () {	
        BrowserRow.updateSubviews.apply(this)
		
        const bv = this.buttonView()
        bv.setTitle(this.node().title())
        
        this.buttonView().setIsEditable(this.node().nodeTitleIsEditable())

        if (this.node().isEnabled()) {
            bv.setOpacity(1)	
        } else {
            bv.setOpacity(0.5)	
        }
		
        return this
    },
    
    onEnterKeyUp: function() {
        this.doAction()
        return false
    },
    
    doAction: function() {
        if (this.node().isEnabled()) { // check in node field?
            this.node().doAction()
        }
        return this     
    },
    
    didClickButton: function() {
        this.doAction()
        return this
    },

    onDidEdit: function (changedView) {     
        this.node().setTitle(this.buttonView().title())
        //this.node().didUpdateView(this)
        this.scheduleSyncFromNode() // needed for validation?
    },
    
})
