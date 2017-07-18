
BrowserHeader = NodeView.extend().newSlots({
    type: "BrowserHeader",
	backArrowView: null,
	titleView: null,
	doesShowBackArrow: false,
	shouldShowTitle: false,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setOwnsView(false)

		var backArrowView = DivView.clone().setDivClassName("BackArrow").setInnerHTML("&#8249;").setTarget(this).setAction("didHitBackArrow")
		this.setBackArrowView(backArrowView)
		

		var titleView = DivView.clone().setDivClassName("BrowserHeaderTitleView").setInnerHTML("title")
		this.setTitleView(titleView)
		
        return this
    },
    
    browser: function() {
        return this.parentView().parentView()
    },

	columnGroup: function() {
		return this.parentView()
	},

    syncFromNode: function() {
        var node = this.node()
        this.removeAllSubviews()
        
        if (node) {
			if (this.doesShowBackArrow()) {
				this.addSubview(this.backArrowView())
			}

            if (this.shouldShowTitle()) {
    		    this.addSubview(this.titleView())
    		    this.titleView().setInnerHTML(node.title())
	        }
			
            node.actions().forEach( (action) => {
                var button = BrowserHeaderAction.clone()
                button.setTarget(node).setAction(action)
                //button._nodeAction = action
                button.setCanClick(this.nodeHasAction(action))
                this.addSubview(button).syncFromNode()
            })
        }
        
        return this
    },
    
    nodeHasAction: function(anAction) {
        return (anAction in this.node())
    },
    
    /*
    hitButton: function(aButton) {
        this.node()[aButton._nodeAction].apply(this.node(), self)
        return this
    },
    */

	didHitBackArrow: function() {
		console.log(this.type() + " back")
		this.browser().popOneActiveColumn()
		//this.columnGroup().column().selectPreviousColumn()
	},
	
	setDoesShowBackArrow: function(aBool) {
		this._doesShowBackArrow = aBool
		this.syncFromNode()
		return this
	},
})


