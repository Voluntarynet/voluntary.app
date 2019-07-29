"use strict"

/*
    
    BrowserTitledRow
    
*/

BrowserRow.newSubclassNamed("BrowserTitledRow").newSlots({
    titleView: null,
    subtitleView: null,
    noteView: null,
    thumbnailView: null,
    isSelected: false,
}).setSlots({
    init: function () {
        BrowserRow.init.apply(this)

        this.setTitleView(this.contentView().addSubview(BrowserRowTitle.clone()))
        this.setSubtitleView(this.contentView().addSubview(BrowserRowSubtitle.clone()))
        this.setNoteView(this.contentView().addSubview(BrowserRowNote.clone()))

        this.updateSubviews()
        this.setIsSelectable(true)
        return this
    },

    hasSubtitle: function() {
        return this.subtitleView().innerHTML().length > 0
    },

    setHasSubtitle: function(aBool) {        
        if (aBool) {
            //this.titleView().setTop(10)
            this.titleView().setMarginTop(10)
        } else {
            //this.titleView().setTop(22)      
            this.titleView().setMarginTop(22)      
        }

        return this
    },
    
    setupThumbnailViewIfAbsent: function() {
        if (!this.thumbnailView()) {
            const tv = DomView.clone().setDivClassName("BrowserRowThumbnailView")
    		tv.makeBackgroundNoRepeat()
            tv.makeBackgroundCentered()
            //tv.makeBackgroundContain()
            tv.setBackgroundSizeWH(50, 50)

            this.setThumbnailView(tv)
            this.addSubview(tv)
            
            // TODO: make this dynamic with subview for title & subtitle
            const offset = 60
            this.titleView().setLeft(offset)
            this.subtitleView().setLeft(offset)
        }
        return this
    },
    
    updateSubviews: function() {
        BrowserRow.updateSubviews.apply(this)
	
        this.setHasSubtitle(this.hasSubtitle())

        const node = this.node()

        this.titleView().setContentEditable(node ? node.nodeTitleIsEditable() : false)
        this.subtitleView().setContentEditable(node ? node.nodeSubtitleIsEditable() : false)
        
        if (node) {
            const b = this.isSelected()
            this.titleView().setIsSelected(b)
            this.subtitleView().setIsSelected(b)
            this.noteView().setIsSelected(b)
            
            if (node) {
                const imageUrl = node.nodeThumbnailUrl()
                if (imageUrl) {
                    this.setupThumbnailViewIfAbsent()
                    this.thumbnailView().verticallyAlignAbsoluteNow() // TODO: optimize this
                    this.thumbnailView().setBackgroundImageUrlPath(imageUrl)
                }
            } 
        }
        
        if (this.noteView().innerHTML() === "&gt;") {
            this.makeNoteRightArrow()
            this.noteView().setInnerHTML("")
        }
		
        return this
    },

    // --- edit ---

    onDidEdit: function (changedView) {   
        //console.log(this.typeId() + ".onDidEdit")
        this.scheduleSyncToNode()
    },

    didInput: function() {
        this.scheduleSyncToNode() //this.syncToNode()
    },

    // --- sync ---

    syncToNode: function () {   
        //console.log("syncToNode")
        const node = this.node()
        node.setTitle(this.titleView().innerHTML())
        node.setSubtitle(this.subtitleView().innerHTML())
        node.tellParentNodes("onDidEditNode", this.node())  
        node.scheduleSyncToStore()
        return this
    },

    syncFromNode: function () {
        const node = this.node()
        this.titleView().setString(node.title())
        this.subtitleView().setString(node.subtitle())
        this.noteView().setString(this.node().note())
        this.updateSubviews()
        return this
    },
    
    // arrow
    
    makeNoteRightArrow: function() {
        const nv = this.noteView()
        nv.setBackgroundImageUrlPath(this.pathForIconName("right-gray"))        
        nv.setBackgroundSizeWH(10, 10)
        nv.setMinAndMaxWidth(10)
        nv.setMinAndMaxHeight(10)
        //nv.setOpacity(0.5)
        return this		
    },
})
