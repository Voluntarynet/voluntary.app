"use strict"

/* 

    BrowserColumnGroup

*/

window.BrowserColumnGroup = class BrowserColumnGroup extends NodeView {
    
    initPrototype () {
        this.newSlot("header", null)
        this.newSlot("footer", null)
        this.newSlot("scrollView", null) // contains column
        this.newSlot("column", null) // is inside scrollView
        this.newSlot("isCollapsed", false)
        this.newSlot("animatesCollapse", true)
        this.newSlot("browser", null)
    }

    init () {
        super.init()
         
        this.setHeader(BrowserHeader.clone())
        this.addSubview(this.header())

        this.setFooter(BrowserFooter.clone())
        //this.addSubview(this.footer())
   
        //this.setColumnWrapper(this)

        this.setScrollView(DomView.clone().setDivClassName("BrowserScrollView"))
        this.addSubview(this.scrollView())
        
        this.setColumn(BrowserColumn.clone())
        this.scrollView().addSubview(this.column())


        this.updateScrollView()
        
        this.addGestureRecognizer(RightEdgePanGestureRecognizer.clone()) 

        return this
    }

    copySizeFrom (bcg) {
        this.setMinAndMaxWidth(bcg.minWidth())
        this.setFlexGrow(bcg.flexGrow())
        return this
    }

    copySetupFrom (bcg) {
        this.setIsCollapsed(bcg.isCollapsed())
        this.copySizeFrom(bcg)
        this.setDisplay(bcg.display())
        this.setPosition(bcg.position())
        return this
    }

    colapse () {
        this.setMinAndMaxWidth(0)
        this.setFlexGrow(0)
        return this
    }

    // caching - used to hold onto view state during drag between columns
    
    
    browser () {
        return this.parentView()
    }
    
    

    cache () {
        this._browser.cacheColumnGroup(this)
        //this.browser().cacheColumnGroup(this)
        //this.debugLog(".cache()")
        return this
    }
    
    uncache () {
        this._browser.uncacheColumnGroup(this)
        //this.browser().uncacheColumnGroup(this)
        //this.debugLog(".uncache()")
        return this
    }

    // edge pan

    acceptsBottomEdgePan () {
        if (this.node().nodeCanEditColumnWidth()) {
            return true
        }
        return false
    }

    acceptsRightEdgePan () {
        if (this.node().nodeCanEditColumnWidth()) {
            return true
        }
        return false

    }

    onRightEdgePanBegin (aGesture) {
        this._beforeEdgePanBorderRight = this.borderRight()
        this.setBorderRight("1px dashed red")
        this.setTransition("min-width 0s, max-width 0s")
        this.setTransition("0s")
        //this.makeCursorColResize()
    }

    onRightEdgePanMove (aGesture) {
        const p = aGesture.currentPosition() // position in document coords
        const f = this.frameInDocument()
        const h = p.x() - f.x()
        const minWidth = this.node() ? this.node().nodeMinWidth() : 10;
        if (h >= minWidth) {
            this.setMinAndMaxWidth(h) // need to do same for contentView?
        } else {
            this.setMinAndMaxWidth(minWidth) 
        }
        return this
    }

    onRightEdgePanComplete (aGesture) {
        this.setBorderRight(this._beforeEdgePanBorderRight)
        //this.makeCursorDefault()
    }

    // -------------------------------------
    
    hasHeader () {
        return true
    }
    
    hasFooter () {
        return this.hasSubview(this.footer())
    }
    
    setHasFooter (aBool) {
        if (this.hasFooter() !== aBool) {
            if (aBool) {
                this.addSubview(this.footer())
            } else {
                this.removeSubview(this.footer())
            }
            this.updateScrollView()
        }
        return this
    }
    
    updateScrollView () {
        const headerHeight = 40
        const footerHeight = 40
        
        let heightOffset = 0
        let top = 0
        
        if (this.hasHeader()) { 
            heightOffset += headerHeight
            top = headerHeight
        }
        
        if (this.hasFooter()) { 
            heightOffset += footerHeight
        }
        
        this.scrollView().setHeight("calc(100% - " + heightOffset + "px)")
        this.scrollView().setTop(top)
        
        return this
    }

    isFirstColumnGroup () {
        return this.browser().columnGroups().first() === this
    }

    didChangeIsSelected () {
        super.didChangeIsSelected()
		
        if (this.column()) {
            this.column().setIsSelected(this.isSelected())
        }	
        return this
    }
	
    previousColumnGroup () {
        const prevCol = this.column().previousColumn()

        if (prevCol) { 
            return prevCol.columnGroup() 
        }

        return null
    }
	
    isFirstUncollapsed () {
        const pcg = this.previousColumnGroup()
        return (!this.isCollapsed()) && (!pcg || pcg.isCollapsed())
    }
	
    shouldShowBackArrow () {
        return !this.isFirstColumnGroup() && this.isFirstUncollapsed()
    }
	
    updateBackArrow () {
        this.header().setDoesShowBackArrow(this.shouldShowBackArrow())
        return this
    }
	
    // collapsing
	
    setIsCollapsed (aBool) {
        if (this._isCollapsed !== aBool) {		
            if (aBool) {
                this.collapse()
            } else {
                this.uncollapse()
            }
        }
        return this
    }
	
    name () {
        return this.node() ? this.index() + "-" + this.node().title() : null
    }
	
    index () {
        return this.browser().columnGroups().indexOf(this)
    }
	
    collapse () {
        //console.log(this.name() + " collapse ")
        this._isCollapsed = true
        this.setMinAndMaxWidth(0)
        this.setFlexGrow(0)
        this.setFlexShrink(0)
        this.setFlexBasis(0)
        return this
    }
	
    uncollapse () {
        //console.log(this.name() + " uncollapse")
        this._isCollapsed = false
        this.matchNodeMinWidth()
        this.setFlexGrow(1)
        this.setFlexShrink(1)
        //this.setFlexBasis(this.targetWidth())
        return this
    }
    
    /// empty label 

    /*
    updateEmptyLabel () {
        let node = this.node()
        if (node) {
            if (node.hasSubnodes() && node.nodeEmptyLabel()) {
                this.setEmptyLabelText(node.nodeEmptyLabel())
                return this
            }
        }
            
        this.removeEmptyLabel()
        return this
    }
    
    addEmptyLabelIfMissing () {
        if (!this.emptyLabel()) {
            this.setEmptyLabel(DomView.clone().setDivClassName("BrowserColumnEmptyLabel"))
            this.setEmptyLabelText("").turnOffUserSelect()
            this.addSubview(this.emptyLabel())            
        }
        
        return this
    }
    
    setEmptyLabelText (aString) {       
        this.addEmptyLabelIfMissing()     
        this.emptyLabel().setInnerHTML(aString)
        return this
    }
    
    removeEmptyLabel () {
        if (this.emptyLabel()) {
            this.removeSubview(this.emptyLabel())
            this.setEmptyLabel(null)
        }
        return this
    }
*/
    
    setColumnClass (columnClass) {
        if (this.column().type() !== columnClass.type()) {
            const view = columnClass.clone().setNode(this.node())
            this.scrollView().removeSubview(this.column())
            this.setColumn(view)
            this.scrollView().addSubview(this.column())
            this.browser().clipToColumnGroup(this)
        }
        return this
    }
    
    /*
    setMinAndMaxWidth (w) {
        Error.showCurrentStack()
		this.debugLog(" / " + (this.node() ? this.node().type() : "?") + " nodeMinWidth = " + w)
        super.setMinAndMaxWidth(w)
        return this
    }
    */

    targetWidth () {
        let w = 0
		
        if (this.node()) {
	        w = this.node().nodeMinWidth()
            if (w === null) {
                return 0
            }

            let rw = this.column().maxRowWidth()
            //console.log("column " + this.node().title() + " maxRowWidth:" + rw)
            this.column().maxRowWidth()
            if (rw > w) {
                w = rw
            }

            if (this.browser() && this.browser().isSingleColumn()) {
                w = this.browser().browserWidth()
                assert (!Type.isNull(w)) 
            }
        }
			
        return w		
    }

    fitToTargetWidth () {
        this.setMinAndMaxWidth(this.targetWidth()+50)
        return this
    }

    matchNodeMinWidth () {
        const w = this.targetWidth()
        if (w) {
            this.setMinAndMaxWidth(w)
        }
        return this
    }
    
    setNode (aNode) {
        if (Type.isNull(aNode) && this.browser() && this.browser().hasCachedColumnGroup(this)) {
            this.debugLog(" setNode(null)")
        }

        if (aNode === this._node) {
            return this
        }
         
        super.setNode(aNode)

        this.setColumnClass(BrowserColumn)
        //this.matchNodeMinWidth()
        
        if (aNode) {
            // obey node's width preferences
            // use custom class for column if node wants it
            const customViewClass = aNode.viewClass()
            if (customViewClass) {
                this.setColumnClass(customViewClass)
            }
            
            this.setHasFooter(aNode.nodeHasFooter())
        }
        
        this.header().setNode(aNode)
        this.column().setNode(aNode)
        this.footer().setNode(aNode)
        return this
    }
    

    /*
    NOT USED - VIEWS DON'T IMPLEMENT didUpdate now - they use didUpdateNode
    the syncFromNode overide in this class handles the subviews
    
    didUpdateNode () {
        dfdffdfdf()
        this.log("didUpdateNode")
        this.header().didUpdateNode()
        this.column().didUpdateNode()
        return this        
    }
    */

    didUpdateNode () {
        super.didUpdateNode()
        
    }

    // just using this to make debugging easier

    syncFromNode () {        
        //console.log("BrowserColumnGroup syncFromNode "  + this.node().type())
        this.header().syncFromNode()
        this.column().syncFromNode()
        //this.updateEmptyLabel()
        return this
    }
}.initThisClass()
