//var assert = require("assert")

BrowserView = NodeView.extend().newSlots({
    type: "BrowserView",
    columns: null,
    isSingleColumn: false,
    defaultHeader: null,
}).setSlots({
 
    bgColors: function() {
        return this.bgColorsGray()
    },
    
    bgColorsGray: function() {
        return [
            //"#404040", 
            //[64/255, 64/255, 64/255],
            [60/255, 60/255, 60/255],
            [48/255, 48/255, 48/255],
            [32/255, 32/255, 32/255],
            [26/255, 26/255, 26/255],
            [16/255, 16/255, 16/255],
        ]
    },
       
    bgColorsWarm: function() {
        return [
            //[0.412, 0.110, 0.067], // header color
            //[0.867, 0.235, 0.145],
            [0.871, 0.278, 0.145],
            //[0.875, 0.325, 0.153],
            [0.875, 0.325, 0.153],
            //[0.882, 0.412, 0.161],
            [0.886, 0.459, 0.165],
            //[0.890, 0.502, 0.169],
            [0.898, 0.545, 0.176],
            //[0.902, 0.592, 0.184],
            [0.906, 0.635, 0.192],
            //[0.914, 0.682, 0.196]
        ]
    },
    
    bgColorsCool: function() {
        return [
            [0.118, 0.506, 0.965],
            //[0.118, 0.525, 0.965],
            [0.122, 0.545, 0.969],
            //[0.118, 0.569, 0.969],
            [0.122, 0.584, 0.976],
            //[0.122, 0.608, 0.976],
            [0.122, 0.627, 0.980],
            //[0.122, 0.651, 0.980],
            [0.125, 0.675, 0.984],
            //[0.125, 0.694, 0.984],
            [0.129, 0.718, 0.988],
            //[0.129, 0.741, 0.988]
        ]
    },
    
    init: function () {
        NodeView.init.apply(this)
        this.setDefaultSubnodeViewClass(BrowserColumnGroup)
        this.setIsRegisterForWindowResize(true)
        
        var dh = DivView.clone().setDivClassName("BrowserDefaultHeader NodeView DivView")
        this.setDefaultHeader(dh)
        this.addSubview(dh)
        
        this.setBackgroundColor(this.bgColorForIndex(Math.round(this.bgColors().length/2)))
		this.setColumnGroupCount(1)
		//.selectFirstColumn()
        return this
    },

	updateBackground: function() {
		var n = this.activeColumnGroups().length
        this.setBackgroundColor(this.bgColorForIndex(n + 1))
	},
    
    prepareToSyncToView: function() {
        console.log(this.type() + " prepareToSyncToView")
        NodeView.prepareToSyncToView.apply(this)
		this.fitColumns()
        return this
    },
    
	// --- resizing ---------------------------------
    
    onWindowResize: function (event) {
        //console.log(this.type() + " onWindowResize")
		this.fitColumns()
		if (this._selectedColumnGroup) {
			this.selectColumn(this._selectedColumnGroup.column())
		}
		return this
    },
    
    updateSingleColumnMode: function() {
        //console.log("---")
        //var size = DocumentBody.zoomAdjustedSize()
        //var w = WebBrowserScreen.orientedWidth()
        //var h = WebBrowserScreen.orientedHeight()
        //console.log("WebBrowserScreen size = " + w + "x" + h)

		var size = WebBrowserScreen.lesserOrientedSize()
        var w = size.width
		var h = size.height
		
        var r = 1
        
        if (w < 800) { 
            r = 1.5
        }
        
        if (w < 500) {
            r = 2
        }

        if (w < 400) {
            r = 2.5
        }

        //console.log("lesserOrientedSize: " + w + "x" + h + " setZoomRatio(" + r + ")") 
        DocumentBody.setZoomRatio(r)
            
        var isSingle = ((w < h) && (w < 800)) || (w < 400)
        //console.log("isSingle = ", isSingle)
        this.setIsSingleColumn(isSingle)

		WebBrowserWindow.setTitle(size.width + " x " + size.height + " " + (isSingle ? "single" : "multi"))

        //console.log("---")
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
		var colors = this.bgColors()
		var rcolors = this.bgColors().reversed()
		rcolors.removeFirst()
		colors = colors.copy().appendItems(rcolors)
		
		var rgb = colors.atModLength(i)


		var s = "rgb(" + rgb.map((v) => { return Math.round(v * 255) }).join(",") + ")"
		//console.log("bgColorForIndex = '" + s + "'")
		return s
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
        //this.log("setColumnGroupCount " + count)
		if (count == 0) {
			ShowStack()
		}

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
	
	popLastActiveColumn: function() {
	    //console.log("popLastActiveColumn this.activeColumnGroups().length = ", this.activeColumnGroups().length)
	    var n = this.activeColumnGroups().length - 1
	    if (n < 0) { n = 0; }
	    //console.log("setColumnGroupCount ", n)
        this.setColumnGroupCount(n) // TODO: collapse cg instead?
	    //console.log("popLastActiveColumn 222 this.activeColumnGroups().length = ", this.activeColumnGroups().length)

        /*
	    n -= 2
	    if (n < 0) { n = 0; }
        this.selectColumn(this.columns()[n])
        */
        this.fitColumns()
	    return this
	},
	
    selectColumn: function(selectedColumn) {
        var selectedColumnGroup = selectedColumn.columnGroup()
		this._selectedColumnGroup = selectedColumnGroup

        var index = this.columnGroups().indexOf(selectedColumn.columnGroup())

		//console.log(this.type() + " selectColumn " + selectedColumn.node().type() + " index " + index)
		
		if (this.isSingleColumn()) {
        	this.setColumnGroupCount(index + 2)
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

	// --- fitting columns in browser ---------------------------------------------

    fitColumns: function () {
        //console.log(this.type() + " fitColumns")
        this.updateSingleColumnMode()

		var lastActiveCg = this.lastActiveColumnGroup()
	
	    //console.log("this.isSingleColumn(): ", this.isSingleColumn())
	    
		if (lastActiveCg && this.isSingleColumn()) {
		    this.fitForSingleColumn()
		} else {
			this.fitForMultiColumn()
		}
		
		return this
	},
	
	updateBackArrow: function() {
   		this.columnGroups().forEach((cg) => {
   			cg.updateBackArrow()    			
   		})
		return this
	},
	
	makeLastActiveColumnFillRemainingSpace: function() {
		// TODO: merge with this code in multi column fit
		var lastActiveCg = this.lastActiveColumnGroup()
		
		var fillWidth = this.browserWidth() - this.widthOfUncollapsedColumnsSansLastActive()
		/*
		if (lastActiveCg.targetWidth() *2 < fillWidth && lastActiveCg.targetWidth() < 500) {
			fillWidth = lastActiveCg.targetWidth()
		}
		*/
		
        if (lastActiveCg) {
    		lastActiveCg.setFlexGrow(1)
    		lastActiveCg.setFlexShrink(1)
    		lastActiveCg.setFlexBasis(fillWidth)
			lastActiveCg.setMinAndMaxWidth(fillWidth)
    	}
		return this
	},
	
	fitForSingleColumn: function() {
		var lastActiveCg = this.lastActiveColumnGroup()
		
	    this.columnGroups().forEach((cg) => {
   			if (cg != lastActiveCg) {
   			    cg.setFlexGrow(0)
   			    cg.setIsCollapsed(true)
   			    cg.setMinAndMaxWidth(0)
   			}
   		})

   		lastActiveCg.setIsCollapsed(false)
   		this.makeLastActiveColumnFillRemainingSpace()
   		this.updateBackArrow()

        console.log("fitForSingleColumn")
		this.setShouldShowTitles(true)
		
   		//console.log("lastActiveCg.node().title() = ", lastActiveCg.node().title(), " width ", lastActiveCg.minWidth(), " ", lastActiveCg.maxWidth())
   		
   		return this
	},
	
	uncollapsedColumns: function() {
		return this.activeColumnGroups().select((cg) => { return !cg.isCollapsed() })		
	},
	
	widthOfUncollapsedColumns: function() {
		return this.uncollapsedColumns().sum((cg) => { return cg.targetWidth(); })		
	},
	
	widthOfUncollapsedColumnsSansLastActive: function() {
		var lastActiveCg = this.lastActiveColumnGroup()
		var cgs = this.uncollapsedColumns()
		//console.log("cgs.length = ", cgs.length)
		cgs.remove(lastActiveCg)
		//console.log("cgs.length = ", cgs.length)
		return cgs.sum((cg) => { return cg.targetWidth(); })		
	},
	
	setShouldShowTitles: function(aBool) {
		this.columnGroups().forEach((cg) => {
			cg.header().setShouldShowTitle(aBool)
		})
		return this
	},
	
	columnDescription: function() {
		var d = this.columnGroups().map((cg) => {
			if (cg.isCollapsed() ) { return "" }
			var s = cg.name() 
			if (cg.node() == null) { s += " [null node] " }
			//s += " " + (cg.isCollapsed() ? "collapsed" : "uncollapsed")
			s += " " + cg.targetWidth() + "px"
			return s
		}).join(" / ")
		
		d += " [" + this.widthOfUncollapsedColumns() + " of " + this.browserWidth() + "]"
		return d
	},
	
	/*
	removeNullColumns: function() {
		this.columnGroups().reverse().map((cg) => {
			//if (cg.node() == null) { this.columnGroups().pop() }
		})
	},
	*/
	
	fitForMultiColumn: function() {
		this.updateBackground()
		// collapse columns as needed
		
        var browserWidth = this.browserWidth()
		var lastActiveCg = this.lastActiveColumnGroup()
		//	console.log("---------")
		this.columnGroups().forEach((cg) => { 
			cg.setIsCollapsed(false)
			//console.log(cg.name() + " targetWidth: " + cg.targetWidth())
		})
		
		//console.log("---------")
		this.columnGroups().forEach((cg) => { 
			var usedWidth = this.widthOfUncollapsedColumns()
			var shouldCollapse = (usedWidth > this.browserWidth()) && (cg != lastActiveCg) 
			shouldCollapse = shouldCollapse || (cg.node() == null)
			//console.log(cg.name() + " shouldCollapse:" + shouldCollapse + " usedWidth: " + usedWidth + " browserWidth:" + this.browserWidth())
			cg.setIsCollapsed(shouldCollapse)
		})
		
		var usedWidth = this.widthOfUncollapsedColumns()
		//console.log("usedWidth: " + usedWidth + " of " + this.browserWidth())

		var fillWidth = this.browserWidth() - this.widthOfUncollapsedColumnsSansLastActive()
		if (lastActiveCg.targetWidth() *2 < fillWidth && lastActiveCg.targetWidth() < 500) {
			fillWidth = lastActiveCg.targetWidth()
		}
		//console.log("fillWidth = ", fillWidth)
        if (lastActiveCg) {
    		lastActiveCg.setFlexGrow(1)
    		lastActiveCg.setFlexShrink(1)
    		lastActiveCg.setFlexBasis(fillWidth)
			lastActiveCg.setMinAndMaxWidth(fillWidth)
    	}

   		this.updateBackArrow()
		this.setShouldShowTitles(false)
		
		//console.log(this.columnDescription())

		return this
	},
	
	/*
	fitForMultiColumn: function() {
		// collapse columns as needed
				
        var browserWidth = this.browserWidth()
		var shouldCollapse = false
        var lastCg = this.columnGroups().last()
        var usedWidth = 0
        var remainingWidth = 0
        
		var lastActiveCg = this.lastActiveColumnGroup()

		this.columnGroups().reversed().forEach((cg) => { 
			// starts from right and goes to left columns
			
		    var w = cg.node() ? cg.node().nodeMinWidth() : 0
		
			shouldCollapse = (usedWidth > browserWidth) && (cg != lastCg)
			
			if (cg.node() === null) {
			    shouldCollapse = true
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
			cg.header().setShouldShowTitle(false)
		})

        if (lastActiveCg) {
    		lastActiveCg.setMinAndMaxWidth(null)
    		lastActiveCg.setFlexGrow(100)
    	}

   		this.updateBackArrow()

		return this
	},
	*/
	
	// -----------------------------------------------

	browserWidth: function() {
		return this.clientWidth()
	},
	
	windowWidth: function() {
	    return App.shared().mainWindow().width()
	},
	
    // --- node paths -----------------------------
    
    selectNode: function(aNode) {
        //console.log("selectNode " + aNode.nodePath())
		if (!aNode) {
			console.warn(this.type() + " selectNode called with null argument")
			ShowStack()
			return this
		}
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
		var cg = this.lastActiveColumnGroup()
		if (cg) { 
	        return cg.node().nodePathString() //.map((node) => { return node.title() }).join("/")
		}
		return "" 
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
		if (lastNode) {
			this.selectNode(lastNode)
		}
        return this
    },
    
    // --- hash paths ------------------------------------- 
    
	syncFromHashPath: function() {
        //console.log("syncFromHashPath WebBrowserWindow.urlHash() = '" + WebBrowserWindow.urlHash() + "'")
	    this.setNodePathString(WebBrowserWindow.urlHash())
        return this	    
	},
	
	syncToHashPath: function() {
        WebBrowserWindow.setUrlHash(this.nodePathString())
        return this
	},
})
