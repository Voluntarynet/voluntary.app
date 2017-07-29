
BrowserHeader = NodeView.extend().newSlots({
    type: "BrowserHeader",
	backArrowView: null,
	titleView: null,
	doesShowBackArrow: false,
	//shouldShowTitle: false,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setOwnsView(false)

		var backArrowView = DivView.clone().setDivClassName("BackArrow").setTarget(this).setAction("didHitBackArrow")
		//backArrowView.setInnerHTML("&#8249;")
		backArrowView.setBackgroundImageUrlPath(this.pathForIconName("left"))        
		backArrowView.setBackgroundSize(10, 10)
		backArrowView.setOpacity(0.6)
		this.setBackArrowView(backArrowView)
		
		var titleView = DivView.clone().setDivClassName("BrowserHeaderTitleView NodeView DivView").setInnerHTML("title").setUserSelect("none")
		this.setTitleView(titleView)
		
		this.setZIndex(2)
        return this
    },
    
    browser: function() {
        return this.parentView().parentView()
    },

	columnGroup: function() {
		return this.parentView()
	},
	
	shouldShowTitle: function() {
	    return this.browser().isSingleColumn()
	},

    syncFromNode: function() {
        var node = this.node()
        this.removeAllSubviews()
        
        if (node) {
            if (this.shouldShowTitle()) {
    		    this.titleView().setInnerHTML(node.title())
    		    this.addSubview(this.titleView())
	        }

			if (this.doesShowBackArrow()) {
				this.addSubview(this.backArrowView())
			}


            node.actions().forEach( (action) => {
                var button = BrowserHeaderAction.clone()
                button.setTarget(node).setAction(action)
                button.setCanClick(this.nodeHasAction(action))
                this.addSubview(button).syncFromNode()
            })
        } else {
            //console.log("no header subviews")
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
		this.browser().popLastActiveColumn()
		//this.columnGroup().column().selectPreviousColumn()
	},
	
	setDoesShowBackArrow: function(aBool) {
		if (this._doesShowBackArrow != aBool) {
			this._doesShowBackArrow = aBool
			this.setNeedsSyncToNode(true)
		}
		return this
	},
})


