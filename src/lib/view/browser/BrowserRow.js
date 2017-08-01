/*

	base row view, just knows about selected, selectable and colors
*/

BrowserRow = NodeView.extend().newSlots({
    type: "BrowserRow",
    isSelected: false,
    isSelectable: true,
    closeButtonView: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setOwnsView(false)
        this.setIsRegisteredForClicks(true)
        //this.setIsRegisteredForMouse(true)
        this.turnOffUserSelect()
        //this.addCloseButton()
        return this
    },
    
    column: function () {
        return this.parentView()
    },
    
    updateSubviews: function() {
        this.setBackgroundColor(this.currentBgColor())
        return this
    },
    
    // -------------
    
    onDidEdit: function (changedView) {   
        //console.log("onDidEdit")
        this.syncToNode()
    },
    
	// --- sync ---
	
    syncToNode: function () {   
        //console.log("syncToNode")
        this.node().setTitle(this.titleView().innerHTML())
        this.node().setSubtitle(this.subtitleView().innerHTML())
        this.node().tellParentNodes("onDidEditNode", this.node())   
        this.node().markDirty()
        return this
    },

    syncFromNode: function () {
        this.updateSubviews()
        return this
    },
    
    onTabKeyUp: function() {
        console.log(this.type() + " onTabKeyUp")
    },

	// --- colors ---
	
	currentBgColor: function() {
		if (this.isSelected()) {
			return this.selectedBgColor()
		} 
		
		return this.unselectedBgColor()
	},

    unselectedBgColor: function() {
        return "transparent"
    },
    
    selectedBgColor: function() {
		if (!this.column()) {
			return "transparent"
		}
        return this.column().selectionColor()
    },
    
    // close button
    
    addCloseButton: function() {
        if (this.closeButtonView() == null) {
            this.setCloseButtonView(NodeView.clone().setDivClassName("BrowserRowCloseButton"))
            this.addSubview(this.closeButtonView()) 
            this.closeButtonView().setTarget(null).setAction("delete").setInnerHTML("&#10799;")
            this.closeButtonView().setOpacity(0).setTransition("all 0.2s")
            /*
            this.closeButtonView().setBackgroundImageUrlPath(this.pathForIconName(this.action()))
    		this.closeButtonView().setBackgroundSize(20, 20) // use "contain" instead?
    		this.closeButtonView().setBackgroundPosition("center")
    		*/
        }
        return this
    },
    
    removeCloseButton: function() {
        if (this.closeButtonView() != null) {
            this.removeSubview(this.closeButtonView()) 
            this.setCloseButtonView(null)
        }
    },
    
    delete: function() {
        if (this.canDelete()) {
            this.node().performAction("delete")
        }
    },

    // sliding
    
    canDelete: function() {
        return this.node() && this.node().hasAction("delete")
    },
    
    /*
    onMouseMove: function (event) {
        if (this.isMouseDown() && this.canDelete()) {
            var diff = this.mouseDownDiffWithEvent(event)
            //console.log("onMouseMove:" + JSON.stringify(diff))
            this.setTransition("all 0s")
            this.setRight(diff.xd)
        }
    },
    */
    
    hasCloseButton: function() {
        return this.closeButtonView().target() != null
    },
    
    onMouseEnter: function(event) {
        console.log(this.type() + " onMouseEnter")
        
        if (this.canDelete() && !this.hasCloseButton()) {
            this.closeButtonView().setOpacity(1)
            this.closeButtonView().setTarget(this)
        }
    },
    
    onMouseLeave: function(event) {
        console.log(this.type() + " onMouseLeave")
        if (this.hasCloseButton()) {
            this.closeButtonView().setOpacity(0)
            this.closeButtonView().setTarget(null)
        }        
    },
    
    onMouseUp: function (event) {
        NodeView.onMouseUp.apply(this, [event])
        if (this.canDelete()) {
            this.setTransition("all 0.2s")
            setTimeout(() => {
                this.setRight(0)
            })
        }
    },
    
	// --- selecting ---
    
    onClick: function (event) {
        if (this.isSelectable()) {
            this.select()
            //console.log(this.type() + " tellParentViews didClickRow")
            this.tellParentViews("didClickRow", this)
        }
		return false
    },

    setIsSelected: function (aBool) {
		if (this._isSelected != aBool) {
	        this._isSelected = aBool
        
	        if (aBool) {
	            this.showSelected()    
	        } else {
	            this.showUnselected() 
	        }
        
	        this.updateSubviews()
		}
        return this
    },

	showSelected: function() {
        //this.setBorderTop("1px solid #333")
        //this.setBorderBottom("1px solid #444")
        this.setOpacity(1)
		return this		
	},
	
	showUnselected: function() {
        //this.setBorderTop("1px solid transparent")
        //this.setBorderBottom("1px solid transparent")
        this.setOpacity(0.7)		
	},
    
    select: function() {
        this.setIsSelected(true)		
        return this
    },

    unselect: function() {
        this.setIsSelected(false)
        return this
    },

})
