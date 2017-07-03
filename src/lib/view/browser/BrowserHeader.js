
BrowserHeader = NodeView.extend().newSlots({
    type: "BrowserHeader",
	backArrowView: null,
	doesShowBackArrow: false,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("BrowserHeader")
        this.setOwnsView(false)

		var ba = DivView.clone().setDivClassName("BackArrow").setInnerHTML("&#8249;").setTarget(this).setAction("back")
		this.setBackArrowView(ba)
        return this
    },
    
    browser: function() {
        return this.parentItem().parentItem()
    },

	columnGroup: function() {
		return this.parentItem()
	},

    syncFromNode: function() {
        var node = this.node()
        this.removeAllItems()
        
        if (node) {
			if (this.doesShowBackArrow()) {
				this.addItem(this.backArrowView())
			}
			
            node.actions().forEach( (action) => {
                var button = BrowserHeaderAction.clone()
                button.setAction(action).setTarget(node)
                this.addItem(button).syncFromNode()
            })
        }
        
        return this
    },

	back: function() {
		console.log(this.type() + " back")
		this.columnGroup().column().selectPreviousColumn()
	},
	
	setDoesShowBackArrow: function(aBool) {
		this._doesShowBackArrow = aBool
		this.syncFromNode()
		return this
	},
})


