
BMChatComposeMessageRowView = BrowserTitledRow.extend().newSlots({
    type: "BMChatComposeMessageRowView",
	content: null,
}).setSlots({
    
    init: function () {
        BrowserTitledRow.init.apply(this)
	//	this.setSelectedBgColor("white")
	//	this.setUnselectedBgColor("white")
		this.titleView().insertDivClassName("BMChatComposeMessageRowViewTitle")

		this.setPaddingTop(10)
		this.setMarginBottom(10)
		this.setMinHeight("auto")
		this.setMaxHeight("auto")
		this.setHeight("auto")
		this.titleView().setWidth("80%")

		this.titleView().setTop(0)
		this.titleView().setPosition("relative")
		this.titleView().setLeft("auto")
		this.titleView().setRight(0)
		if (Math.random() > 0.5) {
			this.titleView().setFloat("right")
		} else {
			this.titleView().setFloat("left")
		}
		this.titleView().setMarginLeft(0)
	//	this.titleView().setMarginRight(100)
		this.setDisplay("block")
		setTimeout(() => { this.updateSubviews() }, 1000)
    },	

    setHasSubtitle: function(aBool) {        
		// so it doesn't adjust title 
        return this
    },

    updateSubviews: function() {
		BrowserTitledRow.updateSubviews.apply(this)
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

