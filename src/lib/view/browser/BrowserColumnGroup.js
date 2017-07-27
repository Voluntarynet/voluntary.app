
BrowserColumnGroup = NodeView.extend().newSlots({
    type: "BrowserColumnGroup",
    header: null,
	scrollView: null, // contains column
    column: null,
    emptyLabel: null,
	isSelected: false,
	doesCollapseIfUnselected: false,
	isCollapsed: false,
	animatesCollapse: true,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)        
        this.setHeader(BrowserHeader.clone())
        this.addSubview(this.header())
    
        //this.setColumnWrapper(this)

		this.setScrollView(DivView.clone().setDivClassName("BrowserScrollView"))
        this.addSubview(this.scrollView())
        
        this.setColumn(BrowserColumn.clone())
        this.scrollView().addSubview(this.column())

        return this
    },

	isFirstColumnGroup: function() {
		return this.browser().columnGroups().first() === this
	},

	setIsSelected: function(aBool) {
		if (this.column()) {
			this.column().setIsSelected(aBool)
		}
		
		if (this._isSelected == aBool) {
			return this
		}
		
		this._isSelected = aBool
	//	this.header().setDoesShowBackArrow(aBool && !this.isFirstColumnGroup())
		
		/*
		if (this.doesCollapseIfUnselected()) {
			if (aBool) {
				console.log(this + " expanding")
				this.uncollapse()
				//this.setMinAndMaxWidth("100%")
			} else {
				this.collapse()
				console.log(this + " collapsing")
			}
		}
		*/
		
		return this
	},
	
	previousColumnGroup: function() {
		//console.log("this.column() = ", this.column())
		var prevCol = this.column().previousColumn()
		if (prevCol) { return prevCol.columnGroup() }
		return null
	},
	
	isFirstUncollapsed: function() {
		var pcg = this.previousColumnGroup()
		return (!this.isCollapsed()) && (!pcg || pcg.isCollapsed())
	},
	
	updateBackArrow: function() {
		this.header().setDoesShowBackArrow(!this.isFirstColumnGroup() && this.isFirstUncollapsed())
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
	
	/*
	isCollapsed: function() {
		return this.display() == "none"
	},
	*/
	
	collapse: function() {
		//console.log(this + " collapse")
		this._isCollapsed = true
		if (this.animatesCollapse()) {
    		this.setMinAndMaxWidth(0)
    		setTimeout(() => { this.setDisplay("none") }, 500)
        } else {
            this.setDisplay("none")
        }
		return this
	},
	

	
	uncollapse: function() {
		//console.log(this + " uncollapse")
		this._isCollapsed = false
		if (this.animatesCollapse()) {
    		this.setDisplay("inline-flex")		
            this.setFlexGrow(1)
    		setTimeout(() => { 
				this.matchNodeMinWidth()
    		}, 10)
    	} else {
    	    this.setDisplay("inline-flex")		
            this.setFlexGrow(1)
			this.matchNodeMinWidth()
    	}
		return this
	},
    
    /// empty label 
    
    updateEmptyLabel: function() {
        var node = this.node()
        if (node) {
            if (node.subnodes().length == 0 && node.nodeEmptyLabel()) {
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
    
    setColumnClass: function(columnClass) {
        if (this.column().type() != columnClass.type()) {
            var view = columnClass.clone().setNode(this.node())
            this.scrollView().removeSubview(this.column())
            this.setColumn(view)
            this.scrollView().addSubview(this.column())
            this.browser().clipToColumnGroup(this)
        }
        return this
    },
    
    /*
    setMinAndMaxWidth: function(w) {
        ShowStack()
		console.log(this.type() + " / " + (this.node() ? this.node().type() : "?") + " nodeMinWidth = " + w)
        NodeView.setMinAndMaxWidth.apply(this, [w])
        return this
    },
    */

	matchNodeMinWidth: function() {
		if (this.node()) {
	        var w = this.node().nodeMinWidth()
	
			if (this.browser().isSingleColumn()) {
				w = this.browser().browserWidth()
			}
			
			//console.log(this.type() + " / " + this.node().type() + " nodeMinWidth = " + w)
			
	        if (w) {
	            this.setMinAndMaxWidth(w)
	        }
		}
		return this
	},
    
    setNode: function(aNode) {
        if (aNode == this._node) {
            //return
        }
         
        NodeView.setNode.apply(this, [aNode])

        this.setColumnClass(BrowserColumn)
        this.matchNodeMinWidth()
        
        if (aNode) {
            // obey node's width preferences
            // use custom class for column if node wants it
            var customViewClass = aNode.viewClass()
            if (customViewClass) {
                this.setColumnClass(customViewClass)
            }
        }
        
        this.header().setNode(aNode)
        this.column().setNode(aNode)
        return this
    },

    browser: function() {
        return this.parentView()
    },
    

    /*
    NOT USED - VIEWS DON'T IMPLEMENT didUpdate now - they use didUpdateNode
    the syncFromNode overide in this class handles the subviews
    
    didUpdate: function() {
        dfdffdfdf()
        this.log("didUpdate")
        this.header().didUpdate()
        this.column().didUpdate()
        return this        
    },
    */

    // just using this to make debugging easier

    syncFromNode: function () {        
        //console.log("BrowserColumnGroup syncFromNode "  + this.node().type())
        this.header().syncFromNode()
        this.column().syncFromNode()
        this.updateEmptyLabel()
        return this
    },
})
