

BMChatMessageRowView = BrowserTitledRow.extend().newSlots({
    type: "BMChatMessageRowView",
	content: null,
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
		
		if (Math.random() > 1.5) {
            this.alignToRight()
		} else {
            this.alignToLeft()
		}        
        
    },
    
    alignToRight: function() {
	    this.titleView().setRight(20)
		this.titleView().setFloat("right")
	    this.titleView().setBorderRadius("8px 8px 0px 8px") // top-left, top-right,  bottom-right, bottom-left
	    return this
    },
    
    alignToLeft: function() {
        this.titleView().setLeft(20)
    	this.titleView().setFloat("left")
        this.titleView().setBorderRadius("8px 8px 8px 0px") // top-left, top-right,  bottom-right, bottom-left 
	    return this
    },

    setHasSubtitle: function(aBool) {        
		// so it doesn't adjust title 
        return this
    },

    //updateSubviews: function() {
    syncToNode: function() {
		BrowserTitledRow.updateSubviews.apply(this)
		this.titleView().setInnerHTML(this.node().title())
		//console.log(this.typeId() + " this.titleView().height() = ", this.titleView().height())
		//this.setMinAndMaxHeight(this.titleView().clientHeight()) 
		/*
		setTimeout(() => { 
			
			//this.titleView().setInnerHTML(this.titleView().innerHTML() + " " + this.titleView().height())
			this.setMinAndMaxHeight(this.titleView().height()) 
			//setTimeout(() => {  this.setMinAndMaxHeight(this.titleView().height()) }, 10)
			}, 10)
			*/
		return this
	},
})


BMChatComposeMessageRowView = BMChatMessageRowView.extend().newSlots({
    type: "BMChatComposeMessageRowView",
	content: null,
}).setSlots({
})

