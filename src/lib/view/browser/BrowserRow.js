
BrowserRow = NodeView.extend().newSlots({
    type: "BrowserRow",
    title: null,
    subtitle: null,
    note: null,
    isSelected: false,
    isSelectable: true,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setOwnsView(false)
        
        this.setTitle(this.addItem(BrowserRowTitle.clone()))
        this.setSubtitle(this.addItem(BrowserRowSubtitle.clone()))
        this.setNote(this.addItem(BrowserRowNote.clone()))
        this.setDivClassName("BrowserRow")

        this.registerForClicks(true)
        this.updateSubviews()
        this.turnOffUserSelect()
        return this
    },
    
    setDivClassName: function(name) {
        NodeView.setDivClassName.apply(this, [name])
        this.title().setDivClassName(name + "Title")
        this.subtitle().setDivClassName(name + "Subtitle")
        this.note().setDivClassName(name + "Note")
        return this   
    },
    
    column: function () {
        return this.parentItem()
    },

    hasSubtitle: function() {
        return this.subtitle().innerHTML().length > 0
    },
    
    updateSubviews: function() {
        //this.title().setHasSubtitle(this.hasSubtitle())
        
        if (this.hasSubtitle()) {
            this.title().setTop(10)
        } else {
            this.title().setTop(22)      
        }

        var node = this.node()
        /*
        var isEditable = node ? node.nodeTitleIsEditable() : false;
        this.setEditable(isEditable)  
        */      
        
        this.title().setContentEditable(node ? node.nodeTitleIsEditable() : false)
        this.subtitle().setContentEditable(node ? node.nodeSubtitleIsEditable() : false)
        
        return this
    },
    
    // -------------
    
    setEditable: function (aBool) {
        this.title().setContentEditable(aBool)
        return this
    },
    
    onDidEdit: function (changedView) {   
        //console.log("onDidEdit")
        this.syncToNode()
        //this.node().didUpdate()
    },
    
    syncToNode: function (changedView) {   
        //console.log("syncToNode")
        this.node().setTitle(this.title().innerHTML())
        this.node().setSubtitle(this.subtitle().innerHTML())
        this.node().tellParents("onDidEditNode", this.node())   
        this.node().markDirty()
        return this
    },
    
    onTabKeyDown: function() {
        console.log(this.type() + " onTabKeyDown")
    },
    
    // -----------------

    onClick: function (anEvent) {
        if (this.isSelectable()) {
            this.select()
            this.tellParents("rowClicked", this)
        }
    },

    unselectionBgColor: function() {
        return "transparent"
    },
    
    selectionBgColor: function() {
        return this.column().selectionColor()
    },
    
    setIsSelected: function (aBool) {
        this._isSelected = aBool
        if (aBool) {
            this.setDivClassName(this.type() + "_Selected")
            this.title().setDivClassName(this.type() + "Title_Selected")
            this.subtitle().setDivClassName(this.type() + "Subtitle_Selected")
            this.note().setDivClassName(this.type() + "Note_Selected")
            this.setBackgroundColor(this.selectionBgColor())
            //this.element().style.borderTop = "1px solid #aaa"
            //this.focus()
        } else {
            this.setDivClassName(this.type())
            this.title().setDivClassName(this.type() + "Title")
            this.subtitle().setDivClassName(this.type() + "Subtitle")
            this.note().setDivClassName(this.type() + "Note")
            this.setBackgroundColor(this.unselectionBgColor())
        }
        //console.log(this.title().innerHTML() + " new divClassName '" + this.divClassName() + "'") 
        return this
    },
    
    select: function() {
        this.setIsSelected(true)
        this.updateSubviews()
        return this
    },

    unselect: function() {
        this.setIsSelected(false)
        this.updateSubviews()
        return this
    },

    syncFromNode: function () {
        var node = this.node()
        
        this.title().setString(node.title())
        this.subtitle().setString(node.subtitle())
        
        this.note().setString(this.node().note())
        this.updateSubviews()
        return this
    },
})
