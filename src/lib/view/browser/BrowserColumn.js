"use strict"

window.BrowserColumn = NodeView.extend().newSlots({
    type: "BrowserColumn",
    rows: null,
    selectionColor: "#aaa",
    allowsCursorNavigation: true,
    debug: true,
    defaultRowStyles: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDefaultSubnodeViewClass(BrowserTitledRow)
        //this.setOwnsView(false)
        this.setIsRegisteredForKeyboard(true)
        this.styles().selected().setBorderLeft("1px solid rgba(0, 0, 0, 0.15)")
        this.styles().unselected().setBorderLeft("1px solid rgba(0, 0, 0, 0.15)")
        this.applyStyles()
        this.setAcceptsFirstResponder(true)
        return this
    },
    
    applyStyles: function() {
        //console.log(this.typeId() + ".applyStyles()")
        NodeView.applyStyles.apply(this)
        return this
    },
    
    title: function() {
        return this.node() ? this.node().title() : ""
    },

    browser: function() {
        assert(this.columnGroup() != null) 
        return this.columnGroup().browser()
    },
    
    columnGroup: function () {
        return this.parentView().parentView()
    },

    // rows

    rows: function() {
        return this.subviews()
    },

    addRow: function(v) {
        return this.addSubview(v)
    },

    removeRow: function(v) {
        return this.removeSubview(v)
    },

    // selection
	
    didChangeIsSelected: function() {
        NodeView.didChangeIsSelected.apply(this)

        if (this.isSelected()) {
            this.focus()
        } else {
            this.blur()
        }
		
        return this
    },

    rowWithNode: function(aNode) {
        return this.rows().detect((row) => { return row.node() === aNode })
    },
    
    didClickRowWithNode: function(aNode) {
        var row = this.rowWithNode(aNode)
        if (!row) {
            throw new Error("column  missing row for node '" + aNode.title() + "'")
        }
        this.didClickRow(row)
        return this
    },
    
    unselectRowsBesides: function(selectedRow) {
        var rows = this.rows()

        // unselect all other rows
        rows.forEach((row) => {
            if (row != selectedRow) {
                row.unselect()
            }
        })
        
        return this
    },
    
    requestSelectionOfRow: function(aRow) {
        return this.didClickRow(aRow)
    },
    
    didClickRow: function(clickedRow) {
        this.unselectRowsBesides(clickedRow)

        // follow it if we can 
        if (clickedRow.nodeRowLink()) {
		    //console.log(this.typeId() + ".didClickRow(" + clickedRow.node().title() + ") selecting column ", this.node().title())
        //	this.browser().selectColumn(this)
        }
        
        this.browser().selectColumn(this)

        return true
    },
    
    rowRequestsAddColumnForNode: function(aNode) {
        
    },
    
    selectedRows: function() {
        return this.subviews().filter((row) => { return row.isSelected(); })
    },

    selectedRow: function() {
        return this.selectedRows()[0]
    },
    
    selectedNode: function() {
        var row = this.selectedRow()
        return row ? row.node() : null
    },
    
    selectedRowIndex: function() {
        return this.rows().indexOf(this.selectedRow())
    },
    
    setSelectedRowIndex: function(index) {
        var oldIndex = this.selectedRowIndex()
        //console.log("this.setSelectedRowIndex(" + index + ") oldIndex=", oldIndex)
        if (index != oldIndex) {
            var rows = this.rows()
            if (index < rows.length && index > -1) {
                var row = rows[index]
                row.select()
                this.didClickRow(row)
            }
        }
        return this
    },
  
    indexOfRowWithNode: function (aNode) {
        return this.rows().detectIndex(row => row.node() === aNode)
    },
    
    clickRowWithNode: function(aNode) {
        var index = this.indexOfRowWithNode(aNode);
        if (index != null) {
            this.setSelectedRowIndex(index)
        }
        return this
    },

    unselectAllRows: function() {
        this.rows().forEach(row => row.unselect())
        return this
    },
	
    selectRowWithNode: function (aNode) {
        var selectedRow = this.rows().detect(row => row.node() === aNode)
		
        if (selectedRow) {
            selectedRow.setIsSelected(true)
			
            this.rows().forEach((aRow) => {
                if (aRow != selectedRow) {
                    aRow.unselect()
                }
            })
        }

        return selectedRow
    },
    
    selectedRowTitle: function () {
        var row = this.selectedRow()
        if (row) { 
            return row.title().innerHTML() 
        }
        return null
    },

    // --- sync -----------------------------

    subviewProtoForSubnode: function(aSubnode) {
        var proto = aSubnode.nodeRowViewClass()
		
        if (!proto) {
            proto = BrowserTitledRow
        }
				
        return proto      
    },

    setNode: function(aNode) {
        if (this.node() != aNode) {
            NodeView.setNode.apply(this, [aNode])
            this.unselectAllRows() // move to didChangeNode
            //"shouldFocusSubnode"
        }
        return this
    },
	
    shouldFocusSubnode: function(aNote) {
	    var subnode = aNote.info()
	    this.clickRowWithNode(subnode)

	    var subview = this.subviewForNode(subnode)
	    
        if (!subview) {
            this.syncFromNode()
	        subview = this.subviewForNode(subnode)
        } 

        if (subview) {
	        var subview = this.subviewForNode(subnode)
		    this.selectRowWithNode(subnode)
		    subview.scrollIntoView()
		    //subview.dynamicScrollIntoView()
        } else {
            console.warn("BrowserColumn for node " + this.node().typeId() + " has no matching subview for shouldFocusSubnode " + subnode.typeId())
            //console.log("subview nodes = ", this.subviews().map(subview => subview.node().typeId()) )
	    }

	    return this 
    },
	
    scrollToSubnode: function(aSubnode) {
	    //console.log(this.typeId() + ".scrollToSubnode")
	    var subview = this.subviewForNode(aSubnode)
	    assert(subview)
	    this.columnGroup().scrollView().setScrollTop(subview.offsetTop())
	    return this 	    
    },
    
    scrollToBottom: function() {
        var last = this.subviews().last()

        if (last) { 
            last.scrollIntoView()
        }

        return this
    },

    didChangeNode: function() {
        NodeView.didChangeNode.apply(this)

        if (this.node() && this.node().nodeRowsStartAtBottom()) {
            setTimeout(() => { this.scrollToBottom() }, 0)
            //this.subviews().last().scrollIntoView()
        }

        return this
    },
	
    scheduleSyncFromNode: function() {
        if (this.browser() == null || this.node() == null) {
            console.warn("WARNING: skipping BrowserColumn.scheduleSyncFromNode")
            console.warn("  this.browser() = " , this.browser())
            console.warn("  this.node() = " , this.node())
            return this
        }	    
	    NodeView.scheduleSyncFromNode.apply(this)
	    return this
    },
	
    syncFromNode: function () {
        
        /*
        if (this.browser() == null) {
            console.warn("WARNING: skipping BrowserColumn.syncFromNode because this.browser() == null")
            console.warn("this.node() = " , this.node())
            //console.warn("this.node().title() = " , this.node().title())
            return
        }
        */
        
        // remember the selection        
        var selectedIndex = this.selectedRowIndex()
        // console.log(this.node().title() + "  selectedIndex 1: " + selectedIndex)
        var thereWasASelection = selectedIndex != -1
        var lastSelectedNode = this.selectedNode()
        
        NodeView.syncFromNode.apply(this)
        
        if (this.node() == null) {
            this.setIsRegisteredForDrop(false)
            return
        }
        
        this.setIsRegisteredForDrop(this.node().acceptsFileDrop())

        if (!thereWasASelection) {
            this.browser().clearColumnsGroupsAfter(this.columnGroup())
        } else {
 
            // select the row matching the last selected node
            var row = this.selectRowWithNode(lastSelectedNode)

            if (row) {
                //this.log("selecting row titled '" + row.title().innerHTML() + "'")
                if (!row.isSelected()) {
                    row.setIsSelected(true)
                    this.didClickRow(row)
                }
            } else {
                //this.log(this.title() + " syncFromNode with new selection")
                //this.log("this.rows().length: " + this.rows().length)
                //this.log("selectedIndex: " + selectedIndex)
                
                // otherwise, select close to last selected index
                if (selectedIndex >= this.rows().length) {
                    selectedIndex = this.rows().length - 1
                }
                
                //console.log(this.node().title() + " selectedIndex : " + selectedIndex)
                //this.log("selectedIndex < this.rows().length: " + (selectedIndex < this.rows().length) )
                
                if (selectedIndex > -1 && selectedIndex < this.rows().length) {
                    var row = this.rows()[selectedIndex]
                    //this.log("selecting row titled '" + row.title().innerHTML() + "'")
                    row.setIsSelected(true)
                    this.didClickRow(row)
                } else {
                    //this.log("clear other columns")
                    this.browser().clearColumnsGroupsAfter(this.columnGroup())
                }
            }
        }
    },

    // --- keyboard controls, arrow navigation -----------------------------
	
    canNavigate: function() {
        return this.allowsCursorNavigation() && this.isActiveElement()
    },
	
    showSelected: function() {
        /*
        todo: add check if visible
        if (this.selectedRow()) {
            this.selectedRow().scrollIntoView()
        }
        */
        return this	    
    },
	
    onUpArrowKeyUp: function(event) {
        if (!this.canNavigate()) { 
            return 
        }
        this.selectPreviousRow()
        this.showSelected()
        return false
    },
	
    onDownArrowKeyUp: function(event) {
        if (!this.canNavigate()) { 
            return 
        }
        this.selectNextRow()
        this.showSelected()
        return false
    },
	
    onLeftArrowKeyUp: function(event) {
        if (!this.canNavigate()) { 
            return 
        }
		
        var pc = this.previousColumn()	
        if (pc) {		
            if (this.selectedRow()) { 
                this.selectedRow().unselect() 
            }
			
            var newSelectedRow = pc.selectedRow()
            newSelectedRow.setShouldShowFlash(true).updateSubviews()
            pc.didClickRow(newSelectedRow)
        	this.selectPreviousColumn()
        }
        return false
    },
	
    onRightArrowKeyUp: function(event) {
        if (!this.canNavigate()) { return }	

        if (this.nextColumn() && this.nextColumn().subviews().length > 0) {
        	this.selectNextColumn()
        }
        return false
    },	
	
    // --- enter key begins row editing ---------------------------
	
    onEnterKeyUp: function(event) {
        //console.log(this.type() + ".onEnterKeyUp()")
        
        if (!this.canNavigate()) { return }
	
        var row = this.selectedRow()
        if (row) { 
		    row.onEnterKeyUp(event)
		    /*
			//row.title().focus() 
			setTimeout(() => {
				row.title().selectAll() 
				setTimeout(() => { row.title().focus() })
			})
			*/
        }

        return false
    },

    // --- keyboard controls, add and delete actions -----------------------------
		
    onDeleteKeyUp: function(event) {
        if (!this.canNavigate()) { return }

        /*
        var sNode = this.selectedNode()
        if (sNode && sNode.hasAction("delete")) { 
			sNode.performAction("delete") 
			if (this.subviews().length == 0) {
				this.selectPreviousColumn()
			}
		}
		*/
        return false
    },
	
    onPlusKeyUp: function(event) {
        if (!this.canNavigate()) { return }		

        var sNode = this.selectedNode()
        if (sNode && sNode.hasAction("add")) { 
            var newNode = sNode.performAction("add") 
	        this.selectNextColumn()
            this.nextColumn().selectRowWithNode(newNode)
        }
        return false		
    },
	
    // -----------------------------
    
    columnIndex: function() {
        return this.browser().columnGroups().indexOf(this.columnGroup())
        //return this.browser().columns().indexOf(this)
    },

    // nextRow

    selectNextRow: function() {
        
        var si = this.selectedRowIndex()

        //console.log(this.type() + ".selectNextRow(), selectedRowIndex:" + this.selectedRowIndex() + "/" + this.rows().length)

        var rows = this.rows()
        if (si == -1) {
            this.setSelectedRowIndex(0)
        } else {
            this.setSelectedRowIndex(si + 1)
        }
        return this
    },
    
    selectPreviousRow: function() {
        var si = this.selectedRowIndex()
        //var rows = this.rows()
        if (si == -1) {
            this.setSelectedRowIndex(0)
        } else {
            this.setSelectedRowIndex(si - 1)
        }
        return this
    },

    // next column
    
    nextColumn: function() {
        var i = this.columnIndex()
        var nextColumn = this.browser().columns()[i+1]
        return nextColumn
    },

    focus: function() {
        NodeView.focus.apply(this)
		
	    if (this.selectedRowIndex() == -1) {
            this.setSelectedRowIndex(0)
        }

        //console.log(this.type() + " focus")
        return this
    },
    
    selectNextColumn: function() {
        var nextColumn = this.nextColumn()
        if (nextColumn) {
            this.blur()
            //console.log("nextColumn.focus()")
            nextColumn.focus()
        }
        return this
    },
    
    // previous column
	
    previousColumn: function() {
        var i = this.columnIndex()
        var prevColumn = this.browser().columns()[i-1]
        return prevColumn
    },

    selectPreviousColumn: function() {
        //this.log("selectPreviousColumn this.columnIndex() = " + this.columnIndex())
        var prevColumn = this.previousColumn()
        if (prevColumn) {
            this.blur()
            prevColumn.focus()
            this.browser().selectColumn(prevColumn)
        }
        return this
    },

    // paths
    
    /*
    browserPathArray: function() {
        var subviews = this.browser().columns().subviewsBefore(this)
        subviews.push(this)
        return subviews
    },
    
    browserPathString: function() {
        return this.browserPathArray().map(function (column) { 
            return column.title()  // + ":" + column.node().type()
        }).join("/")
    },
    */

    logName: function() {
        return this.browserPathString()
    },

    maxRowWidth: function() {
        var maxWidth = this.rows().maxValue(function(row) {
            return row.calcWidth()
        })			
        return maxWidth	
    },
	
})

