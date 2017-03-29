//var assert = require("assert")

Browser = NodeView.extend().newSlots({
    type: "Browser",
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
        this.setItemProto(BrowserColumnGroup)
        this.watchForWindowResize()
        return this
    },
    
    watchForWindowResize: function() {
        var self = this
        window.addEventListener('resize', function(event) {
            //console.log("resize ", event)
            self.onResize(event)
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

    columnGroups: function() {
        return this.items()
    },
    
    columns: function() {
        var columns = []
        this.columnGroups().forEach(function (cg) { columns.push(cg.column()) })
        return columns
        
        //return this.columnGroups().map(function (cg) { return cg.column() })
    },
    
    bgColorForIndex: function(i) {
        var c = this.bgColors()
        return c[i % c.length]
    },

    addColumnGroup: function(v) {
        var cg = this.addItem(v)
        return cg
    },
    
    focusEach: function () {
        if (this._hasDoneFocusEach) { 
            console.log("skipping Browser focusEach because it hoses editing")
            return 
        }
        //console.log(" Browser focusEach")
        this._hasDoneFocusEach = true
        this.columnGroups().forEach(function (cg) { 
            cg.column().focus()
        })
    },
    
    updateColumnPositions: function () {
        this.columnGroups().forEach(function (cg) { 
            //cg.column().setTop(80)
        })
        
        /*
        var w = 0
        this.columnGroups().forEach(function (cg) { 
            cg.setLeft(w)
            w += cg.minWidth() 
        })
        */         
        return this
    },
    
    setupColumnGroupColors: function() {
        var cgs = this.columnGroups()
        
        for (var i = 0; i < cgs.length; i ++) {
            var cg = cgs[i]
                        
            if (cg.column().type() == "BrowserColumn") {
                var bgColor = this.bgColorForIndex(i)
 
                /*
                if (cg.node()) { 
                    console.log(i + "/" + cgs.length +  " " + cg.node().type() + " nodeBgColor: " + cg.node().nodeBgColor())
                }
                */
                               
                if (cg.node() && cg.node().nodeBgColor()) { 
                    bgColor = cg.node().nodeBgColor() 
                }
                
                cg.column().setBackgroundColor(bgColor)
                
                if (cg.column().setSelectionColor) {
                    cg.column().setSelectionColor(this.bgColorForIndex(i+1))
                } 
            } 
        }    
        return this
    },

    removeColumnGroup: function(v) {
        return this.removeItem(v)
    },
    
    setColumnGroupCount: function(count) {
        //this.log("setColumnGroupCount " + count)
        
        if (this.columnGroups().length == 2 && count == 1) {
            throw "what?"
        }
        
        while (this.columnGroups().length > count) {
            this.removeColumnGroup(this.columnGroups().last())
        }
        
        
        while (this.columnGroups().length < count) {
            this.addColumnGroup()
            
        }
        
        this.updateColumnPositions()
        this.setupColumnGroupColors()
        //this.log("this.columnGroups().length = " + this.columnGroups().length)
        assert(this.columnGroups().length  == count)
        return this
    },

    fitLastColumnGroupToRemainingWidth: function() {
        var otherColsWidth = 0
        var lastCg = this.columnGroups().last()
        //console.log("index of last column group = " + this.columnGroups().indexOf(lastCg))

        // set other columns width to that of their nodes
        // and get total width 
        this.columnGroups().forEach( function (cg) {
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

    selectColumn: function(selectedColumn) {
        var selectedColumnGroup = selectedColumn.parentItem()
        
        var index = this.columnGroups().indexOf(selectedColumn.columnGroup())
        //console.log("index: " + index)
        this.setColumnGroupCount(index + 2)
        //console.log("selectColumn index: " + index + " cg " + this.columnGroups().length)

        var nextCg = this.columnGroups().itemAfter(selectedColumnGroup)

        if (nextCg) {
            var nextNode = selectedColumnGroup.column().selectedRow().node()
            nextCg.setNode(nextNode)
            this.clearColumnsGroupsAfter(nextCg)
            //nextCg.column().setTitle(selectedColumn.selectedRowTitle())
            //this.log(" --- selectColumn sync")
            
            nextCg.syncFromNode()
        }
        
        this.setupColumnGroupColors()
        this.fitLastColumnGroupToRemainingWidth()
        
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
        
        for (var i = 0; i < columnGroups.length; i++) {
            cg = columnGroups[i]
            //this.log(" --- syncFromNode sync")
            cg.syncFromNode()
        }
        
        //this.setupColumnGroupColors()
        
        return this
    },
    
    clipToColumnGroup: function (cg) {
        var index = this.columnGroups().indexOf(cg)
        this.setColumnGroupCount(index + 1)
        return this
    },
    
    widthOfColumnGroups: function () {
        var w = 0
        this.columnGroups().forEach(function (cg) { w += cg.minWidth() })      
        return w        
    },
    
    fitToColumnWidths: function() {   
        App.shared().mainWindow().setWidth(this.widthOfColumnGroups())
        return this
    },
    
    ///////////// new untested code ///////////////////////
    
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
        
        for (var i = 0; i < nodePathArray.length; i++ ) {
            var node = nodePathArray[i];
            //console.log("node[" + i + "] = ", node.title())
            //console.log("column = ", column)
            column.clickRowWithNode(node)
            //column.selectNextColumn()
            column = column.nextColumn()
        }
        
        this.syncFromNode()
    },
    
})
