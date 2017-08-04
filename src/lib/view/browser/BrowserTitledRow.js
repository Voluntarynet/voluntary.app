
BrowserTitledRow = BrowserRow.extend().newSlots({
    type: "BrowserTitledRow",
    titleView: null,
    subtitleView: null,
    noteView: null,
    isSelected: false,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
        this.setTitleView(this.addSubview(BrowserRowTitle.clone()))
        this.setSubtitleView(this.addSubview(BrowserRowSubtitle.clone()))
        this.setNoteView(this.addSubview(BrowserRowNote.clone()))
		//this.updateSubviews()
		this.setIsSelectable(true)
        return this
    },

    hasSubtitle: function() {
        return this.subtitleView().innerHTML().length > 0
    },


    updateSubviews: function() {
		BrowserRow.updateSubviews.apply(this)
	
		this.titleView().setHasSubtitle(this.hasSubtitle())

        var node = this.node()
        this.titleView().setContentEditable(node ? node.nodeTitleIsEditable() : false)
        this.subtitleView().setContentEditable(node ? node.nodeSubtitleIsEditable() : false)

        this.titleView().setIsSelected(this._isSelected)
        this.subtitleView().setIsSelected(this._isSelected)
        this.noteView().setIsSelected(this._isSelected)

		this.setColor(this.unselectedTextColor())

/*
		if (true) {
	        this.titleView().setMaxWidth(this.node().parentNode().nodeMinWidth() - 30)
	        this.subtitleView().setMaxWidth(this.node().parentNode().nodeMinWidth() - 30)
		}
*/	
        return this
    },

	// text color
	
	currentTextColor: function() {
		if (this.isSelected()) {
			this.selectedTextColor()
		} 
		return this.unselectedTextColor()		
	},

	selectedTextColor: function() {
		return "white"
	},
	
	unselectedTextColor: function() {
		return "rgba(255, 255, 255, 0.5)"
	},

    // -------------

    onDidEdit: function (changedView) {   
        //console.log("onDidEdit")
        this.syncToNode()
    },

    syncToNode: function (changedView) {   
        //console.log("syncToNode")
        this.node().setTitle(this.titleView().innerHTML())
        this.node().setSubtitle(this.subtitleView().innerHTML())
        this.node().tellParentNodes("onDidEditNode", this.node())   
        this.node().markDirty()
        return this
    },

    // -----------------

    syncFromNode: function () {
        var node = this.node()

        this.titleView().setString(node.title())
        this.subtitleView().setString(node.subtitle())
        this.noteView().setString(this.node().note())
        this.updateSubviews()
        return this
    },
})
