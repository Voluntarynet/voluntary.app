"use strict"

window.BrowserHeader = NodeView.extend().newSlots({
    type: "BrowserHeader",
	backArrowView: null,
	titleView: null,
	doesShowBackArrow: false,
	shouldShowTitle: false,
	
	rightActionsView: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setOwnsView(false)

		var backArrowView = DivView.clone().setDivClassName("BackArrow").setTarget(this).setAction("didHitBackArrow")
		backArrowView.setBackgroundImageUrlPath(this.pathForIconName("left"))        
		backArrowView.setBackgroundSizeWH(10, 10)
		backArrowView.setOpacity(0.6)
		this.setBackArrowView(backArrowView)
		
		var titleView = DivView.clone().setDivClassName("BrowserHeaderTitleView NodeView DivView").setInnerHTML("").setUserSelect("none")
		this.setTitleView(titleView)
		
		this.setRightActionsView(DivView.clone().setDivClassName("BrowserFooterRightActionsView"))
		this.addSubview(this.rightActionsView())
		
		this.setZIndex(2)
        return this
    },

	columnGroup: function() {
		return this.parentView()
	},
	
    browser: function() {
        return this.columnGroup().parentView()
    },
    
	setShouldShowTitle: function(aBool) {
		if (this._shouldShowTitle != aBool) {
			this._shouldShowTitle = aBool
			this.scheduleSyncFromNode()
			//console.log(" ----- " + (this.node() ? this.node().title() : null) + " setShouldShowTitle ", aBool)
		}
		return this
	},
	
	shouldShowTitle: function() {
		return this.browser().isSingleColumn() && this.browser().lastActiveColumnGroup() == this.columnGroup()
	},
	
	showsAction: function(actionName) {
		return actionName != "delete" // uses row delete action instead of column header action now
		/*
		if (actionName == "delete" && !WebBrowserWindow.isOnMobile()) {
			return false
		}
		return true
		*/
	},

    syncFromNode: function() {
        var node = this.node()
        this.removeAllSubviews()
        
        if (node && this.browser()) {
            if (this.shouldShowTitle()) {
    		    this.titleView().setSafeInnerHTML(node.nodeHeaderTitle())
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
		//console.log(this.type() + " back")
		this.browser().popLastActiveColumn()
		//this.columnGroup().column().selectPreviousColumn()
	},
	
	setDoesShowBackArrow: function(aBool) {
		if (this._doesShowBackArrow != aBool) {
			//console.log(this.node().title() + " setDoesShowBackArrow " + aBool)
			this._doesShowBackArrow = aBool
			this.scheduleSyncFromNode()
		}
		return this
	},
})


