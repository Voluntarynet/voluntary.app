"use strict"

/*
    
    BrowserTitledRow
    
*/

window.BrowserTitledRow = class BrowserTitledRow extends BrowserRow {
    
    initPrototype () {
        this.newSlots({
            titleView: null,
            subtitleView: null,
            noteView: null,
            thumbnailView: null,
            isSelected: false,
        })
    }

    init () {
        super.init()

        this.setTitleView(this.contentView().addSubview(BrowserRowTitle.clone()))
        this.setSubtitleView(this.contentView().addSubview(BrowserRowSubtitle.clone()))
        this.setNoteView(this.contentView().addSubview(BrowserRowNote.clone()))
        
        this.titleView().setUsesDoubleTapToEdit(true)

        this.updateSubviews()
        this.setIsSelectable(true)
        return this
    }

    hasSubtitle () {
        return this.subtitleView().innerHTML().length > 0
    }

    setHasSubtitle (aBool) {        
        if (aBool) {
            this.titleView().setMarginTop(6)
        } else {
            this.titleView().setMarginTop(13)    // 13   
        }

        return this
    }
    
    setupThumbnailViewIfAbsent () {
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
    }
    
    updateSubviews () {
        BrowserRow.updateSubviews.apply(this)
	
        this.setHasSubtitle(this.hasSubtitle())

        const node = this.node()

        this.titleView().setIsEditable(node ? node.nodeCanEditTitle() : false)
        this.subtitleView().setIsEditable(node ? node.nodeCanEditSubtitle() : false)
        
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

            if (this.node().note() === "&gt;") {
                this.noteView().setInnerHTML("")
                this.makeNoteRightArrow()
            } else {
                this.noteView().setString(node.note())
            }
        }


		
        return this
    }

    // --- edit ---

    didInput () {
        this.scheduleSyncToNode()
    }

    // --- sync ---

    syncToNode  () {   
        //console.log("syncToNode")
        const node = this.node()
        node.setTitle(this.titleView().innerText())
        node.setSubtitle(this.subtitleView().innerText())
        //node.tellParentNodes("onDidEditNode", this.node())  
        //node.scheduleSyncToStore() // TODO: this should be handled by the node
        return this
    }

    syncFromNode  () {
        const node = this.node()
        this.titleView().setString(node.title())
        this.subtitleView().setString(node.subtitle())
        //this.noteView().setString(this.node().note())
        this.updateSubviews()
        return this
    }
    
    // arrow
    
    makeNoteRightArrow () {
        const nv = this.noteView()
        nv.setBackgroundImageUrlPath(this.pathForIconName("right-gray"))        
        nv.setBackgroundSizeWH(10, 10)
        nv.setMinAndMaxWidth(10)
        nv.setMinAndMaxHeight(10)
        //nv.setOpacity(0.5)
        return this		
    }
    
}.initThisClass()
