//var assert = require("assert")

BrowserView = NodeView.extend().newSlots({
    type: "BrowserView",
    columns: null,
    bgColors: [
            //"#404040", 
            //"#3c3c3c", 
            "#303030", 
            "#202020", "#1a1a1a", "#111", 
            "#232323", "#000", 
            "#232323", "#000", 
            "#232323", "#000"
            ],
    //bgColors: ["#151515"],
    
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("Browser")
        this.setSubviewProto(BrowserColumnGroup)
        this.registerForWindowResize(true)
        return this
    },

	// --- resizing ---------------------------------
    
    onWindowResize: function (event) {
        this._hasDoneFocusEach = false
		this.focusEach()
		this.fitColumns()
    },


	// --- columns -------------------------------

    columnGroups: function() {
        return this.subviews()
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
                               
                if (cg.node() && cg.node().nodeBgColor()) { 
                    bgColor = cg.node().nodeBgColor() 
                }
                
//                cg.column().setBackgroundColor(bgColor)
                cg.setBackgroundColor(bgColor)

                if (cg.column().setSelectionColor) {
                    cg.column().setSelectionColor(this.bgColorForIndex(i+1))
                } 
            } 
			i ++
        })

        return this
    },

	// --- focus each somehow prevents a weird layout bug -----
    
    focusEach: function () {
        if (this._hasDoneFocusEach) { 
            console.log("skipping Browser focusEach because it hoses editing")
            return 
        }
        //console.log(" Browser focusEach")
        this._hasDoneFocusEach = true
        this.columnGroups().forEach( (cg) => { 
            cg.column().focus()
        })
    },
    
/*
    updateColumnPositions: function () {
		this.columnGroups().forEach( (cg) => { 
            //cg.column().setTop(80)
        })

        var w = 0
        this.columnGroups().forEach(function (cg) { 
            cg.setLeft(w)
            w += cg.minWidth() 
        })

        return this
    },
*/
        
    setColumnGroupCount: function(count) {
        //this.log("setColumnGroupCount " + count)
        
        if (this.columnGroups().length == 2 && count == 1) {
            throw "this shouldn't happen"
        }
        
		// remove any excess columns
        while (this.columnGroups().length > count) {
            this.removeColumnGroup(this.columnGroups().last())
        }
        
		// add columns as needed
        while (this.columnGroups().length < count) {
            this.addColumnGroup(BrowserColumnGroup.clone())
            
        }
        
        //this.updateColumnPositions()
        this.setupColumnGroupColors()
        //this.log("this.columnGroups().length = " + this.columnGroups().length)
        assert(this.columnGroups().length  == count)
        return this
    },

	windowWidth: function() {
		return App.shared().mainWindow().width()
	},

    clearColumnsGroupsAfter: function(selectedCg) {
        var cgs = this.columnGroups()
        var index = cgs.indexOf(selectedCg)
        
        //this.setColumnGroupCount(index)
                
        for (var i = index + 1; i < cgs.length; i ++) {
            var cg = cgs[i]
            //this.log(" --- clearColumnsGroupsAfter sync")
            cg.setNode(null).syncFromNode()
        }
    },

	// --- column selection ---------------------------------------

	selectFirstColumn: function() {
		this.selectColumn(this.columns()[0])
		return this
	},
	
	updateSelectedColumnTo: function(selectedColumn) {
        var selectedColumnGroup = selectedColumn.columnGroup()
        this.columnGroups().forEach(function (cg) { 
			cg.setIsSelected(cg === selectedColumnGroup) 
        })		
	},
	
    selectColumn: function(selectedColumn) {
        var selectedColumnGroup = selectedColumn.columnGroup()

        var index = this.columnGroups().indexOf(selectedColumn.columnGroup())
		
        this.setColumnGroupCount(index + 3)
        //console.log("selectColumn index: " + index + " cg " + this.columnGroups().length)

        var nextCg = this.columnGroups().itemAfter(selectedColumnGroup)		

        if (nextCg) {
            var selectedRow = selectedColumnGroup.column().selectedRow()

			if (selectedRow) {
	            var nextNode = selectedRow.node().nodeRowLink()
	            nextCg.setNode(nextNode)
	            this.clearColumnsGroupsAfter(nextCg)
	            //nextCg.column().setTitle(selectedColumn.selectedRowTitle())
	            //this.log(" --- selectColumn sync")
            
	            nextCg.syncFromNode()
				//console.log("nextNode = ", nextNode.isKindOf(BMFieldSetNode))
			
				if (nextNode.view().type() != "BrowserColumnGroup" || nextNode.isKindOf(BMFieldSetNode)) {
					this.setColumnGroupCount(index + 2)
				}
			} // should this be here?
        }
        
        this.setupColumnGroupColors()
		this.fitColumns()

		this.updateSelectedColumnTo(selectedColumn)
        
        return this
    },

    rowClicked: function(row) {
        //console.log("Browser rowClicked ", row)
        return true
    },

    syncFromNode: function () {
        //this.log("syncFromNode")
        var columnGroups = this.columnGroups()
        columnGroups[0].setNode(this.node())
        
		columnGroups.forEach((cg) => {
            cg.syncFromNode()
        })
                
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
    
    // --- node paths -----------------------------
    
    selectNode: function(aNode) {
        this.selectNodePath(aNode.nodePath())
        return this
    },
    
    selectNodePath: function(nodePathArray) {
        this.setColumnGroupCount(1)

        var column = this.columns()[0];
        
        //console.log("nodePathArray 1 = ", nodePathArray)
        
        if (nodePathArray[0] == column.node()) {
            nodePathArray.removeFirst()
        }
        //console.log("nodePathArray 2 = ", nodePathArray)
        
		nodePathArray.forEach((node) => {
            //console.log("node[" + i + "] = ", node.title())
            //console.log("column = ", column)
            column.clickRowWithNode(node)
            //column.selectNextColumn()
            column = column.nextColumn()
        })
        
        this.syncFromNode()
    },

	// --- collapsing column groups -----
	
    fitColumns: function () {
		// collapse columns as needed
		var widthsSum = 0
        var winWidth = this.windowWidth()
		var shouldCollapse = false
        var lastCg = this.columnGroups().last()
		
		this.columnGroups().reversed().forEach((cg) => { 
            widthsSum += cg.node() ? cg.node().nodeMinWidth() : 0
			shouldCollapse = (widthsSum > winWidth) && (cg != lastCg)
			cg.setIsCollapsed(shouldCollapse)
		})
		
		this.columnGroups().forEach((cg) => { 
			cg.setFlexGrow(1)
			cg.updateBackArrow()
			//cg.setMinAndMaxWidth(null)
		})
		
		// have last column fit remaining width
		lastCg.setMinAndMaxWidth(null)
		lastCg.setFlexGrow(100)
		return this
	},
    
})
