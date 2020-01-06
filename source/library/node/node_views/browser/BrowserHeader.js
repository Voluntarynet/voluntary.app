"use strict"

/*

    BrowserHeader

*/

window.BrowserHeader = class BrowserHeader extends NodeView {
    
    initPrototype () {
        this.newSlot("backArrowView", null)
        this.newSlot("titleView", null)
        this.newSlot("doesShowBackArrow", false)
        this.newSlot("shouldShowTitle", false)
        this.newSlot("rightActionsView", null)
        this.newSlot("actionButtons", null)
    }

    init () {
        super.init()
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
    }

    columnGroup () {
        return this.parentView()
    }
	
    browser () {
        return this.columnGroup().browser()
    }
    
    setShouldShowTitle (aBool) {
        if (this._shouldShowTitle !== aBool) {
            this._shouldShowTitle = aBool
            this.scheduleSyncFromNode()
            //console.log(" ----- " + (this.node() ? this.node().title() : null) + " setShouldShowTitle ", aBool)
        }
        return this
    }
	
    shouldShowTitle () {
        return this.browser().isSingleColumn() && this.browser().lastActiveColumnGroup() === this.columnGroup()
    }
	
    showsAction (actionName) {
        return actionName !== "delete" // uses row delete action instead of column header action now
    }

    syncFromNode () {
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
    }

    syncActionButtons () {
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
    }
    
    nodeHasAction (anAction) {
        return this.node().respondsTo(anAction)
    }

    didHitBackArrow () {
        //this.debugLog(" back")
        this.browser().previous()
    }
	
    setDoesShowBackArrow (aBool) {
        if (this._doesShowBackArrow !== aBool) {
            //console.log(this.node().title() + " setDoesShowBackArrow " + aBool)
            this._doesShowBackArrow = aBool
            this.scheduleSyncFromNode()
        }
        return this
    }
    
}.initThisClass()


