//var assert = require("assert")

BrowserView = NodeView.extend().newSlots({
    type: "BrowserView",
    columns: null,
    bgColors: [
            //"#404040", 
            "#3c3c3c", 
            "#303030", 
            "#202020", "#1a1a1a", "#111", 
            "#232323", "#000", 
            "#232323", "#000", 
            "#232323", "#000"
            ],
    isSingleColumn: false,
    defaultHeader: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDefaultSubnodeViewClass(BrowserColumnGroup)
        this.setIsRegisterForWindowResize(true)
        
        var dh = DivView.clone().setDivClassName("BrowserDefaultHeader")
        this.setDefaultHeader(dh)
        this.addSubview(dh)
        
        this.setBackgroundColor(this.bgColorForIndex(1))
		this.setColumnGroupCount(1)
		//.selectFirstColumn()
        return this
    },
    
    prepareToSyncToView: function() {
        console.log(this.type() + " prepareToSyncToView")
        NodeView.prepareToSyncToView.apply(this)
		this.fitColumns()
        return this
    },
    
	// --- resizing ---------------------------------
    
    onWindowResize: function (event) {
		this.fitColumns()
		return this
    },
    
    updateSingleColumnMode: function() {
        if (Window.width() < Window.height()) {
            this.setIsSingleColumn(true)
        }
        return this
    },

	// --- columns -------------------------------

    columnGroups: function() {
        return this.subviews().select((subview) => { return subview.isKindOf(BrowserColumnGroup) })
    },

    addColumnGroup: function(v) {
        return this.addSubview(v)
    },

    removeColumnGroup: function(v) {
        return this.removeSubview(v)
    },

    columns: function() {
        return this.columnGroups().map( (cg) => { return cg.column() })
    },
    
	// --- column background colors ----------------------------
	
    bgColorForIndex: function(i) {
		return this.bgColors().atModLength(i)
    },

    setupColumnGroupColors: function() {
        var i = 0
        
        this.columnGroups().forEach((cg) => {
                        
            if (cg.column().type() == "BrowserColumn") {
                var bgColor = this.bgColorForIndex(i)
                               
                if (cg.node() && cg.node().nodeBackgroundColor()) { 
                    bgColor = cg.node().nodeBackgroundColor() 
                }
                
                cg.setBackgroundColor(bgColor)

                if (cg.column().setSelectionColor) {
                    cg.column().setSelectionColor(this.bgColorForIndex(i+1))
                } 
            } 
			i ++
        })

        return this
    },
    
    activeColumnGroups: function() {
        return this.columnGroups().select((cg) => { return !(cg.node() === null); })
    },
        
    setColumnGroupCount: function(count) {
        this.log("setColumnGroupCount " + count)

        /*
		// collapse excess columns
        for (var i = count; i < this.columnGroups().length - 1; i ++) {
            this.columnGroups()[i].collpase()
        }
        */
            
		// remove any excess columns
        while (this.columnGroups().length > count) {
            this.removeColumnGroup(this.columnGroups().last())
        }
        
        //this.clearColumnsGroupsAfterIndex(count -1)
                
		// add columns as needed
        while (this.columnGroups().length < count) {
            var newCg = BrowserColumnGroup.clone()
            this.addColumnGroup(newCg)
            newCg.setMinAndMaxWidth(0)
            newCg.setFlexGrow(0)
        }
        
        //this.updateColumnPositions()
        this.setupColumnGroupColors()
        //this.log("this.columnGroups().length = " + this.columnGroups().length)
        //assert(this.columnGroups().length  == count)
        return this
    },

    clearColumnsGroupsAfterIndex: function(index) {
        var cgs = this.columnGroups()
        for (var i = index + 1; i < cgs.length; i ++) {
            var cg = cgs[i]
            //console.log("clearing column group ", i)
            cg.setNode(null).syncFromNode()
        }
        return this        
    },

    clearColumnsGroupsAfter: function(selectedCg) {
        var cgs = this.columnGroups()
        var index = cgs.indexOf(selectedCg)
        this.clearColumnsGroupsAfterIndex(index)
    },

	// --- column selection ---------------------------------------

	selectFirstColumn: function() {
		this.selectColumn(this.columns().first())
		return this
	},
	
	updateSelectedColumnTo: function(selectedColumn) {
        var selectedColumnGroup = selectedColumn.columnGroup()
        this.columnGroups().forEach(function (cg) { 
			cg.setIsSelected(cg === selectedColumnGroup) 
        })
        
        this.syncToHashPath()
	},
	
	popOneActiveColumn: function() {
	    //console.log("popOneActiveColumn this.activeColumnGroups().length = ", this.activeColumnGroups().length)
	    var n = this.activeColumnGroups().length - 1
	    if (n < 1) { n = 1; }
	    //console.log("setColumnGroupCount ", n)
        this.setColumnGroupCount(n) // TODO: collapse cg instead?
        this.fitColumns()
	    return this
	},
	
    selectColumn: function(selectedColumn) {
        var selectedColumnGroup = selectedColumn.columnGroup()

        var index = this.columnGroups().indexOf(selectedColumn.columnGroup())
		
		if (this.isSingleColumn()) {
        	this.setColumnGroupCount(index + 0)
		} else {
        	this.setColumnGroupCount(index + 3)
		}
        //console.log("selectColumn index: " + index + " cg " + this.columnGroups().length)

        var nextCg = this.columnGroups().itemAfter(selectedColumnGroup)		

        if (nextCg) {
            var selectedRow = selectedColumnGroup.column().selectedRow()

			selectedColumnGroup.matchNodeMinWidth() // testing
			
			if (selectedRow) {
	            var nextNode = selectedRow.node().nodeRowLink() // returns receiver by default
	            nextCg.setNode(nextNode)
	            this.clearColumnsGroupsAfter(nextCg)
	            //nextCg.column().setTitle(selectedColumn.selectedRowTitle())            
	            nextCg.syncFromNode()
			
				if (nextNode.view().type() != "BrowserColumnGroup" || nextNode.isKindOf(BMFieldSetNode)) { // TODO: use a better rule here
					this.setColumnGroupCount(index + 2)
				}
			} // should this be here?
        }
        
        this.setupColumnGroupColors()
		this.fitColumns()

		this.updateSelectedColumnTo(selectedColumn)
        
        return this
    },

    didClickRow: function(row) {
        console.log("Browser didClickRow ", row)
        return true
    },

    syncFromNode: function () {
        //this.log("syncFromNode")
        var columnGroups = this.columnGroups()
        columnGroups.first().setNode(this.node())
        
		columnGroups.forEach((cg) => {
            cg.syncFromNode()
        })
        
        this.fitColumns()
        return this
    },
    
    clipToColumnGroup: function (cg) {
        var index = this.columnGroups().indexOf(cg)
        this.setColumnGroupCount(index + 1)
        return this
    },

	// --- width --------------------------
    
    widthOfColumnGroups: function () {
        return this.columnGroups().sum( (cg) => { return cg.minWidth() })      
    },
    
	// --- collapsing column groups -----
	
	lastActiveColumnGroup: function() {
		return this.columnGroups().reversed().detect((cg) => { return cg.column().node() != null; })
    },

    fitColumns: function () {
        this.updateSingleColumnMode()
        
		// collapse columns as needed
		var widthsSum = 0
        var browserWidth = this.browserWidth()
		var shouldCollapse = false
        var lastCg = this.columnGroups().last()
        var usedWidth = 0
        var remainingWidth = 0
        
		//ShowStack()
		//console.log(this.type() + " isSingleColumn = ", this.isSingleColumn() + ", node = ", this.node().type())
		
		var lastActiveCg = this.lastActiveColumnGroup()
		
		//this.columnGroups().forEach((cg) => { console.log("cg.column().node() = ", cg.column().node()); })
		
		//console.log("lastActiveCg = ", lastActiveCg ? lastActiveCg.node().title() : null)
		
		if (lastActiveCg && this.isSingleColumn()) {
		    
		    this.columnGroups().forEach((cg) => {
    			if (cg != lastActiveCg) {
    			    cg.setFlexGrow(0)
    			    cg.setIsCollapsed(true)
    			    cg.setMinAndMaxWidth(0)
    		        if (cg.node()) { cg.node().setNodeMinWidth(0) }
    			}
    		})

    		lastActiveCg.setIsCollapsed(false)
    		
    		this.columnGroups().forEach((cg) => {
    			cg.updateBackArrow()    			
    		})
    		
    		lastActiveCg.node().setNodeMinWidth(null)
    		lastActiveCg.setMinAndMaxWidth(Window.width())
    		lastActiveCg.setFlexGrow(100)  
    		
    		console.log("lastActiveCg.node().title() = ", lastActiveCg.node().title(), " width ", lastActiveCg.minWidth(), " ", lastActiveCg.maxWidth())
    		
    		return this ////////////////////////////////// early return
		} 

		this.columnGroups().reversed().forEach((cg) => { 
		    var w = cg.node() ? cg.node().nodeMinWidth() : 0
            widthsSum += w
			shouldCollapse = (widthsSum > browserWidth) && (cg != lastCg)
			if (cg.node() === null) {
			    cg.setMinAndMaxWidth(0)
			    cg.setFlexGrow(0)
			} else {
			    cg.setFlexGrow(1)
            }
			
			if (cg == lastActiveCg) {
			    remainingWidth =  this.browserWidth() - usedWidth
			}
			if (!shouldCollapse) {
			    usedWidth += w
			}
			cg.setIsCollapsed(shouldCollapse)
		})
		
		this.columnGroups().forEach((cg) => {
			cg.setFlexGrow(1)
			cg.updateBackArrow()
			//cg.setMinAndMaxWidth(null)
		})

        if (lastActiveCg) {
    		lastActiveCg.setMinAndMaxWidth(null)
    		lastActiveCg.setFlexGrow(100)
    	}
		return this
	},

	browserWidth: function() {
		return this.width()
	},
	
	windowWidth: function() {
	    return App.shared().mainWindow().width()
	},
	
    // --- node paths -----------------------------
    
    selectNode: function(aNode) {
        //console.log("selectNode " + aNode.nodePath())
        this.selectNodePath(aNode.nodePath())
        return this
    },
    
    selectNodePath: function(nodePathArray) {
        //console.log("selectNodePath " + nodePathArray.map((node) => { return node.title() }).join("/") )
        this.setColumnGroupCount(1)
            
        
        var column = this.columns().first();
                
        if (nodePathArray.first() == column.node()) {
           // console.log("selectNodePath removeFirst")
            nodePathArray.removeFirst()
        }
        
		nodePathArray.forEach((node) => {
           // console.log("clicking node " + node.title())
            column.clickRowWithNode(node)
            //column.selectNextColumn()
            column = column.nextColumn()
        })
        
        //this.syncFromNode()
    },

    nodeStringPath: function() {
    },
    
    nodePathArray: function() {
        return this.activeColumnGroups().map((cg) => { return cg.node() })
    },
    
    nodePathString: function() {
        return this.lastActiveColumnGroup().node().nodePathString() //.map((node) => { return node.title() }).join("/")
    },
    
    setNodePathString: function(pathString) {
        if (pathString == null || pathString.length == 0) {
            return this
        }
        var parts = pathString.split("/")
        parts.removeFirst()
        pathString = parts.join("/")
        var lastNode = this.node().nodeAtSubpathString(pathString) 
        // TODO: select as much of the path as exists if full path not valid
       // console.log("lastNode = ", lastNode)
        this.selectNode(lastNode)
        return this
    },
    
    // --- hash paths ------------------------------------- 
    
	syncFromHashPath: function() {
        //console.log("syncFromHashPath Window.urlHash() = '" + Window.urlHash() + "'")
	    this.setNodePathString(Window.urlHash())
        return this	    
	},
	
	syncToHashPath: function() {
        Window.setUrlHash(this.nodePathString())
        return this
	},
})
