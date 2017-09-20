"use strict"

window.BrowserTitledRow = BrowserRow.extend().newSlots({
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
		this.updateSubviews()
		this.setIsSelectable(true)
        return this
    },

    hasSubtitle: function() {
        return this.subtitleView().innerHTML().length > 0
    },

    setHasSubtitle: function(aBool) {        
        if (aBool) {
            this.titleView().setTop(10)
        } else {
            this.titleView().setTop(22)      
        }

        return this
    },

    updateSubviews: function() {
		BrowserRow.updateSubviews.apply(this)
	
		this.setHasSubtitle(this.hasSubtitle())

        var node = this.node()
        this.titleView().setContentEditable(node ? node.nodeTitleIsEditable() : false)
        this.subtitleView().setContentEditable(node ? node.nodeSubtitleIsEditable() : false)

        this.titleView().setIsSelected(this._isSelected)
        this.subtitleView().setIsSelected(this._isSelected)
        this.noteView().setIsSelected(this._isSelected)

        this.titleView().setSelectedColor(this.selectedTextColor())
        this.titleView().setUnselectedColor(this.unselectedTextColor())

        this.subtitleView().setSelectedColor(this.selectedTextColor())
        this.subtitleView().setUnselectedColor(this.unselectedTextColor())

        this.noteView().setSelectedColor(this.selectedTextColor())
        this.noteView().setUnselectedColor(this.unselectedTextColor())

		/*
		if (this.isSelected()) {
			this.setColor(this.selectedTextColor())
		} else {
			this.setColor(this.unselectedTextColor())
		}
		*/
		
        return this
    },

	// --- text color ---
	
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

    // --- edit ---

    onDidEdit: function (changedView) {   
        console.log(this.typeId() + ".onDidEdit")
        this.scheduleSyncToNode()
    },

	didInput: function() {
        this.scheduleSyncToNode() //this.syncToNode()
	},

    // --- sync ---

    syncToNode: function () {   
        //console.log("syncToNode")
        this.node().setTitle(this.titleView().innerHTML())
        this.node().setSubtitle(this.subtitleView().innerHTML())
        this.node().tellParentNodes("onDidEditNode", this.node())  
        this.node().scheduleSyncToStore()
        return this
    },

    syncFromNode: function () {
        var node = this.node()
        this.titleView().setString(node.title())
        this.subtitleView().setString(node.subtitle())
        this.noteView().setString(this.node().note())
        this.updateSubviews()
        return this
    },
})
