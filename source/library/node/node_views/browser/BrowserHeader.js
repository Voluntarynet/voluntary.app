"use strict"

/*

    BrowserHeader

*/

NodeView.newSubclassNamed("BrowserHeader").newSlots({
    backArrowView: null,
    titleView: null,
    doesShowBackArrow: false,
    shouldShowTitle: false,
	
    rightActionsView: null,
    actionButtons: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setActionButtons([])

        const backArrowView = ButtonView.clone().setDivClassName("BackArrow").setTarget(this).setAction("didHitBackArrow")
        backArrowView.setBackgroundImageUrlPath(this.pathForIconName("left"))        
        backArrowView.setBackgroundSizeWH(10, 10)
        backArrowView.setOpacity(0.6)
        this.setBackArrowView(backArrowView)
		
        const titleView = DomView.clone().setDivClassName("BrowserHeaderTitleView NodeView DomView").setInnerHTML("").setUserSelect("none")
        this.setTitleView(titleView)
		
        this.setRightActionsView(DomView.clone().setDivClassName("BrowserFooterRightActionsView"))
        this.addSubview(this.rightActionsView())
		
        this.setZIndex(2)
        return this
    },

    columnGroup: function() {
        return this.parentView()
    },
	
    browser: function() {
        return this.columnGroup().browser()
    },
    
    setShouldShowTitle: function(aBool) {
        if (this._shouldShowTitle !== aBool) {
            this._shouldShowTitle = aBool
            this.scheduleSyncFromNode()
            //console.log(" ----- " + (this.node() ? this.node().title() : null) + " setShouldShowTitle ", aBool)
        }
        return this
    },
	
    shouldShowTitle: function() {
        return this.browser().isSingleColumn() && this.browser().lastActiveColumnGroup() === this.columnGroup()
    },
	
    showsAction: function(actionName) {
        return actionName !== "delete" // uses row delete action instead of column header action now
    },

    syncFromNode: function() {
        const node = this.node()

        this.removeAllSubviews()
        
        if (node && this.browser()) {
            if (this.shouldShowTitle()) {
    		    this.titleView().setInnerHTML(node.nodeHeaderTitle())
    		    this.addSubviewIfAbsent(this.titleView())
	        } else {
                this.removeSubviewIfPresent(this.titleView())
            }

            if (this.doesShowBackArrow()) {
                this.addSubviewIfAbsent(this.backArrowView())
            } else {
                this.removeSubviewIfPresent(this.backArrowView())
            }

            //this.syncActionButtons()
        } else {
            //console.log("no header subviews")
        }
        
        return this
    },

    syncActionButtons: function() {
        //const oldButtons = this.actionButtons()

        node.actions().forEach((action) => {
            if (this.showsAction(action)) {
                const button = BrowserHeaderAction.clone()
                button.setTarget(node).setAction(action)
                button.setCanClick(this.nodeHasAction(action))
                this.addSubview(button).syncFromNode()
            }
        })

        return this
    },
    
    nodeHasAction: function(anAction) {
        return this.node().respondsTo(anAction)
    },

    didHitBackArrow: function() {
        //console.log(this.typeId() + " back")
        this.browser().previous()
    },
	
    setDoesShowBackArrow: function(aBool) {
        if (this._doesShowBackArrow !== aBool) {
            //console.log(this.node().title() + " setDoesShowBackArrow " + aBool)
            this._doesShowBackArrow = aBool
            this.scheduleSyncFromNode()
        }
        return this
    },
})


