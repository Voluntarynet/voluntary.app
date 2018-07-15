"use strict"

window.BrowserTitledRow = BrowserRow.extend().newSlots({
    type: "BrowserTitledRow",
    titleView: null,
    subtitleView: null,
    noteView: null,
    thumbnailView: null,
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
    
    setupThumbnailViewIfAbsent: function() {
        if (!this.thumbnailView()) {
            var tv = DivView.clone().setDivClassName("BrowserRowThumbnailView")
    		tv.makeBackgroundNoRepeat()
            tv.makeBackgroundCentered()
            //tv.makeBackgroundContain()
            tv.setBackgroundSizeWH(50, 50)

            
            this.setThumbnailView(tv)
            this.addSubview(tv)
            
            // TODO: make this dynamic with subview for title & subtitle
            var offset = 60
            this.titleView().setLeft(offset)
            this.subtitleView().setLeft(offset)
        }
        return this
    },
    
    updateSubviews: function() {
        BrowserRow.updateSubviews.apply(this)
	
        this.setHasSubtitle(this.hasSubtitle())

        this.titleView().setContentEditable(node ? node.nodeTitleIsEditable() : false)
        this.subtitleView().setContentEditable(node ? node.nodeSubtitleIsEditable() : false)
            
        var node = this.node()
        
        if (node) {
            var b = this.isSelected()
            this.titleView().setIsSelected(b)
            this.subtitleView().setIsSelected(b)
            this.noteView().setIsSelected(b)
            
            if (node) {
                var imageUrl = node.nodeThumbnailUrl()
                if (imageUrl) {
                    this.setupThumbnailViewIfAbsent()
                    this.thumbnailView().verticallyAlignAbsoluteNow() // TODO: optimize this
                    this.thumbnailView().setBackgroundImageUrlPath(imageUrl)
                }
            } 
        }
        
        if (this.noteView().innerHTML() == "&gt;") {
            this.makeNoteRightArrow()
            this.noteView().setInnerHTML("")
        }
		
        return this
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
    
    // arrow
    
    makeNoteRightArrow: function() {
        this.noteView().setBackgroundImageUrlPath(this.pathForIconName("right-gray"))        
        this.noteView().setBackgroundSizeWH(10, 10)
        this.noteView().setMinAndMaxWidth(10).setMinAndMaxHeight(10)
        //this.noteView().setOpacity(0.5)
        return this		
    },
})
