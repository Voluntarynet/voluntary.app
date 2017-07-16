
BrowserHeader = NodeView.extend().newSlots({
    type: "BrowserHeader",
	backArrowView: null,
	doesShowBackArrow: false,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setOwnsView(false)

		var ba = DivView.clone().setDivClassName("BackArrow").setInnerHTML("&#8249;").setTarget(this).setAction("didHitBackArrow")
		this.setBackArrowView(ba)
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
			
            node.actions().forEach( (action) => {
                var button = BrowserHeaderAction.clone()
                button.setAction(action).setTarget(node)
                this.addSubview(button).syncFromNode()
            })
        }
        
        return this
    },

	didHitBackArrow: function() {
		console.log(this.type() + " back")
		this.columnGroup().column().selectPreviousColumn()
	},
	
	setDoesShowBackArrow: function(aBool) {
		this._doesShowBackArrow = aBool
		this.syncFromNode()
		return this
	},
})


