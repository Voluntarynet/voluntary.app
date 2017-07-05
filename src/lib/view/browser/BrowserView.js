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
        this.watchForWindowResize()
        return this
    },

	// --- resizing ---------------------------------
    
    watchForWindowResize: function() {
        window.addEventListener('resize', (event) => {
            //console.log("resize ", event)
            this.onResize(event)
        }, false);
    },
    
    onResize: function (event) {
        //var r = document.body.getBoundingClientRect()
        //console.log("onResize ")
        //console.log("onResize " + r.width + " x " + r.right)
        //console.log("onResize " + window.innerWidth + " x " + window.innerHeight)
        //console.log("onResize " + document.body.clientHeight + " x " + document.body.clientHeight)
        this.fitLastColumnGroupToRemainingWidth()
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
                
                cg.column().setBackgroundColor(bgColor)
                
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

    fitLastColumnGroupToRemainingWidth: function() {

        var otherColsWidth = 0
        var lastCg = this.columnGroups().last()
		var lastNode = lastCg.column().node()
		
		//console.log("lastCg.column().node() = ", lastNode.view().type())

        //console.log("index of last column group = " + this.columnGroups().indexOf(lastCg))

        // set other columns width to that of their nodes
        // and get total width 
        this.columnGroups().forEach((cg) => {
            if (cg != lastCg) { 
                var mw = cg.node() ? cg.node().nodeMinWidth() : 100 // not sure why this happens
                otherColsWidth += mw 
                cg.setMinAndMaxWidth(mw)
            }
        })
        
        var winWidth = App.shared().mainWindow().width()
        var diffWidth = winWidth - otherColsWidth
        var lastWidth = lastCg.node() ? lastCg.node().nodeMinWidth() : 0;
        
        //console.log("winWidth: " + winWidth + " diffWidth: " + diffWidth + " lastWidth: " + lastWidth)
        
        if (lastWidth == 0) {
            lastCg.setMinAndMaxWidth(diffWidth)
        } else if (diffWidth > lastWidth) {
            lastCg.setMinAndMaxWidth(diffWidth)
        } else {
            lastCg.setMinAndMaxWidth(lastWidth)
        }
        
        this.fitToColumnWidths()

        return this
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
        var selectedColumnGroup = selectedColumn.parentView()
        this.columnGroups().forEach(function (cg) { 
			cg.setIsSelected(cg === selectedColumnGroup) 
        })		
	},
	
    selectColumn: function(selectedColumn) {
        var selectedColumnGroup = selectedColumn.parentView()

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
        this.fitLastColumnGroupToRemainingWidth()

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
        
        //this.setupColumnGroupColors()
        
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
    
    fitToColumnWidths: function() {   
        App.shared().mainWindow().setWidth(this.widthOfColumnGroups())
        return this
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
    
})
