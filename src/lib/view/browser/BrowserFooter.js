
BrowserFooter = NodeView.extend().newSlots({
    type: "BrowserFooter",

	leftActionsView: null,
	textView: null,
	rightActionsView: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setOwnsView(false)

		this.setLeftActionsView(DivView.clone().setDivClassName("BrowserFooterLeftActionsView"))
		
		var textView = DivView.clone().setDivClassName("BrowserHeaderTitleView NodeView DivView").setInnerHTML("").setUserSelect("none")
		this.setTextView(textView)
		
		this.setRightActionsView(DivView.clone().setDivClassName("BrowserFooterRightActionsView"))
						
		this.setZIndex(2)
        return this
    },
    
	columnGroup: function() {
		return this.parentView()
	},
	
    browser: function() {
        return this.columnGroup().parentView()
    },

    syncFromNode: function() {
        var node = this.node()
        this.removeAllSubviews()
        
        if (node && this.browser()) {
            if (this.shouldShowTitle()) {
    		    this.titleView().setInnerHTML(node.nodeHeaderTitle())
    		    this.addSubview(this.titleView())
	        }

			if (this.doesShowBackArrow()) {
				this.addSubview(this.backArrowView())
			}

            node.actions().forEach((action) => {
				if (this.showsAction(action)) {
	                var button = BrowserHeaderAction.clone()
	                button.setTarget(node).setAction(action)
	                button.setCanClick(this.nodeHasAction(action))
	                this.addSubview(button).syncFromNode()
				}
            })
        } else {
            //console.log("no header subviews")
        }
        
        return this
    },
    
    nodeHasAction: function(anAction) {
        return (anAction in this.node())
    },

	didHitBackArrow: function() {
		console.log(this.type() + " back")
		this.browser().popLastActiveColumn()
		//this.columnGroup().column().selectPreviousColumn()
	},
	
	setDoesShowBackArrow: function(aBool) {
		if (this._doesShowBackArrow != aBool) {
			//console.log(this.node().title() + " setDoesShowBackArrow " + aBool)
			this._doesShowBackArrow = aBool
			this.setNeedsSyncFromNode(true)
		}
		return this
	},
})


