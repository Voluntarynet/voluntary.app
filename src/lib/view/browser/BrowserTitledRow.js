
BrowserTitledRow = BrowserRow.extend().newSlots({
    type: "BrowserTitledRow",
    titleView: null,
    subtitleView: null,
    noteView: null,
    isSelected: false,
    isSelectable: true,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)
        //this.setDivClassName("BrowserRow")
        this.setTitleView(this.addItem(BrowserRowTitle.clone()))
        this.setSubtitleView(this.addItem(BrowserRowSubtitle.clone()))
        this.setNoteView(this.addItem(BrowserRowNote.clone()))
		//this.updateSubviews()
        return this
    },

    hasSubtitle: function() {
        return this.subtitleView().innerHTML().length > 0
    },

    updateSubviews: function() {
		this.titleView().setHasSubtitle(this.hasSubtitle())

        var node = this.node()
        this.titleView().setContentEditable(node ? node.nodeTitleIsEditable() : false)
        this.subtitleView().setContentEditable(node ? node.nodeSubtitleIsEditable() : false)

        this.titleView().setIsSelected(this._isSelected)
        this.subtitleView().setIsSelected(this._isSelected)
        this.noteView().setIsSelected(this._isSelected)
        this.setBackgroundColor(this.currentBgColor())

		if (this.isSelected()) {
			this.setColor("white")
		} else {
			this.setColor("CBCBCB")
		}
		
        return this
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
        this.node().tellParents("onDidEditNode", this.node())   
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
