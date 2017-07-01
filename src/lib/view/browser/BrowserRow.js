/*

	base row view, just knows about selected, selectable and colors
*/

BrowserRow = NodeView.extend().newSlots({
    type: "BrowserRow",
    isSelected: false,
    isSelectable: true,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setOwnsView(false)
        this.setDivClassName("BrowserRow")
        this.registerForClicks(true)
        this.turnOffUserSelect()
        return this
    },
    
    column: function () {
        return this.parentItem()
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
    
    syncToNode: function () {   
        //console.log("syncToNode")
        this.node().setTitle(this.titleView().innerHTML())
        this.node().setSubtitle(this.subtitleView().innerHTML())
        this.node().tellParents("onDidEditNode", this.node())   
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
    
    // -----------------

    onClick: function (anEvent) {
        if (this.isSelectable()) {
            this.select()
            this.tellParents("rowClicked", this)
        }
		return false
    },

	// colors
	
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

	// selecting
    
    setIsSelected: function (aBool) {
        this._isSelected = aBool
        this.updateSubviews()
        return this
    },
    
    select: function() {
        this.setIsSelected(true)
        this.updateSubviews()

		if (this.node().didSelect) {
			this.node().didSelect(this)
		}
		
        return this
    },

    unselect: function() {
        this.setIsSelected(false)
        this.updateSubviews()
        return this
    },

})
