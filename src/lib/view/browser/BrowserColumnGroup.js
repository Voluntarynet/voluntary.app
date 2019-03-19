"use strict"

/* 

    BrowserColumnGroup

*/

window.BrowserColumnGroup = NodeView.extend().newSlots({
    type: "BrowserColumnGroup",
    
    header: null,
    footer: null,
    
    scrollView: null, // contains column
    column: null, // is inside scrollView
    
    //emptyLabel: null,

    isCollapsed: false,
    animatesCollapse: true,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
         
        this.setHeader(BrowserHeader.clone())
        this.addSubview(this.header())

        this.setFooter(BrowserFooter.clone())
        //this.addSubview(this.footer())
   
        //this.setColumnWrapper(this)

        this.setScrollView(DivView.clone().setDivClassName("BrowserScrollView"))
        this.addSubview(this.scrollView())
        
        this.setColumn(BrowserColumn.clone())
        this.scrollView().addSubview(this.column())

        this.updateScrollView()
        
        return this
    },
    
    hasHeader: function() {
        return true
    },
    
    hasFooter: function() {
        return this.hasSubview(this.footer())
    },
    
    setHasFooter: function(aBool) {
        if (this.hasFooter() != aBool) {
            if (aBool) {
                this.addSubview(this.footer())
            } else {
                this.removeSubview(this.footer())
            }
            this.updateScrollView()
        }
        return this
    },
    
    updateScrollView: function() {
        let  headerHeight = 40
        let  footerHeight = 40
        
        let  heightOffset = 0
        let  top = 0
        
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
    },

    isFirstColumnGroup: function() {
        return this.browser().columnGroups().first() === this
    },

    didChangeIsSelected: function() {
        NodeView.didChangeIsSelected.apply(this)
		
        if (this.column()) {
            this.column().setIsSelected(this.isSelected())
        }	
        return this
    },
	
    previousColumnGroup: function() {
        let  prevCol = this.column().previousColumn()
        if (prevCol) { return prevCol.columnGroup() }
        return null
    },
	
    isFirstUncollapsed: function() {
        let  pcg = this.previousColumnGroup()
        return (!this.isCollapsed()) && (!pcg || pcg.isCollapsed())
    },
	
    shouldShowBackArrow: function() {
        return !this.isFirstColumnGroup() && this.isFirstUncollapsed()
    },
	
    updateBackArrow: function() {
        this.header().setDoesShowBackArrow(this.shouldShowBackArrow())
        return this
    },
	
    // collapsing
	
    setIsCollapsed: function(aBool) {
        if (this._isCollapsed != aBool) {		
            if (aBool) {
                this.collapse()
            } else {
                this.uncollapse()
            }
        }
        return this
    },
	
    name: function() {
        return this.node() ? this.index() + "-" + this.node().title() : null
    },
	
    index: function() {
        return this.browser().columnGroups().indexOf(this)
    },
	
    collapse: function() {
        //console.log(this.name() + " collapse ")
        this._isCollapsed = true
        this.setMinAndMaxWidth(0)
        this.setFlexGrow(0)
        this.setFlexShrink(0)
        this.setFlexBasis(0)
        return this
    },
	
    uncollapse: function() {
        //console.log(this.name() + " uncollapse")
        this._isCollapsed = false
        this.matchNodeMinWidth()
        this.setFlexGrow(1)
        this.setFlexShrink(1)
        //this.setFlexBasis(this.targetWidth())
        return this
    },
    
    /// empty label 

    /*
    updateEmptyLabel: function() {
        let  node = this.node()
        if (node) {
            if (node.subnodes().length === 0 && node.nodeEmptyLabel()) {
                this.setEmptyLabelText(node.nodeEmptyLabel())
                return this
            }
        }
            
        this.removeEmptyLabel()
        return this
    },
    
    addEmptyLabelIfMissing: function() {
        if (!this.emptyLabel()) {
            this.setEmptyLabel(DivView.clone().setDivClassName("BrowserColumnEmptyLabel"))
            this.setEmptyLabelText("").turnOffUserSelect()
            this.addSubview(this.emptyLabel())            
        }
        
        return this
    },
    
    setEmptyLabelText: function(aString) {       
        this.addEmptyLabelIfMissing()     
        this.emptyLabel().setInnerHTML(aString)
        return this
    },
    
    removeEmptyLabel: function() {
        if (this.emptyLabel()) {
            this.removeSubview(this.emptyLabel())
            this.setEmptyLabel(null)
        }
        return this
    },
*/
    
    setColumnClass: function(columnClass) {
        if (this.column().type() != columnClass.type()) {
            let  view = columnClass.clone().setNode(this.node())
            this.scrollView().removeSubview(this.column())
            this.setColumn(view)
            this.scrollView().addSubview(this.column())
            this.browser().clipToColumnGroup(this)
        }
        return this
    },
    
    /*
    setMinAndMaxWidth: function(w) {
        StackTrace.shared().showCurrentStack()
		console.log(this.typeId() + " / " + (this.node() ? this.node().type() : "?") + " nodeMinWidth = " + w)
        NodeView.setMinAndMaxWidth.apply(this, [w])
        return this
    },
    */

    targetWidth: function() {
        let  w = 0
		
        if (this.node()) {
	        w = this.node().nodeMinWidth()
            if (w == null) {
                return 0
            }
	
            if (this.browser() && this.browser().isSingleColumn()) {
                w = this.browser().browserWidth()
                assert (w != null) 
            }
        }
		
			
        return w		
    },

    matchNodeMinWidth: function() {
        let  w = this.targetWidth()
        if (w) {
            this.setMinAndMaxWidth(w)
        }
        return this
    },
    
    setNode: function(aNode) {
        if (aNode == this._node) {
            //return
        }
         
        NodeView.setNode.apply(this, [aNode])

        this.setColumnClass(BrowserColumn)
        //this.matchNodeMinWidth()
        
        if (aNode) {
            // obey node's width preferences
            // use custom class for column if node wants it
            let  customViewClass = aNode.viewClass()
            if (customViewClass) {
                this.setColumnClass(customViewClass)
            }
            
            this.setHasFooter(aNode.nodeHasFooter())
        }
        
        this.header().setNode(aNode)
        this.column().setNode(aNode)
        this.footer().setNode(aNode)
        return this
    },

    browser: function() {
        return this.parentView()
    },
    

    /*
    NOT USED - VIEWS DON'T IMPLEMENT didUpdate now - they use didUpdateNode
    the syncFromNode overide in this class handles the subviews
    
    didUpdateNode: function() {
        dfdffdfdf()
        this.log("didUpdateNode")
        this.header().didUpdateNode()
        this.column().didUpdateNode()
        return this        
    },
    */

    // just using this to make debugging easier

    syncFromNode: function () {        
        //console.log("BrowserColumnGroup syncFromNode "  + this.node().type())
        this.header().syncFromNode()
        this.column().syncFromNode()
        //this.updateEmptyLabel()
        return this
    },
})
