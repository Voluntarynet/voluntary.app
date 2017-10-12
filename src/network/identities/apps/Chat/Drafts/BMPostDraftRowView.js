

"use strict"

window.BMPostDraftRowView = BrowserTitledRow.extend().newSlots({
    type: "BMPostDraftRowView",
}).setSlots({
    
    init: function () {
        BrowserTitledRow.init.apply(this)
	//	this.setSelectedBgColor("white")
	//	this.setUnselectedBgColor("white")

		this.setDisplay("block")
		
		this.setMinHeight("auto")
		this.setMaxHeight("1000px")
		this.setHeight("auto")
		
		this.setPaddingTop(10)
		this.setMarginBottom(10)
		
		this.setupTitleView()
    },
    
    setupTitleView: function() {
		this.titleView().insertDivClassName(this.type() + "Title")
		this.titleView().setWidth("auto")
		this.titleView().setMinWidth("50px")
		this.titleView().setMaxWidth("calc(100% - 100px)")

		this.titleView().setTop(0)
		this.titleView().setPosition("relative")
		this.titleView().setLeft(null)
		this.titleView().setMarginRight(20)
		this.titleView().setMarginLeft(0)
    },

    setHasSubtitle: function(aBool) {        
		// so it doesn't adjust title 
        return this
    },

	message: function() {
		return this.node()
	},

    updateSubviews: function() {
		BrowserTitledRow.updateSubviews.apply(this)

		return this
	},
	

})

