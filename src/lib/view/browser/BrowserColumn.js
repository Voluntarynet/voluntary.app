"use strict"

/* 

    BrowserColumn

*/

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
        //this.setOwnsView(false)
        this.setIsRegisteredForKeyboard(true)
        this.styles().selected().setBorderLeft("1px solid rgba(0, 0, 0, 0.15)")
        this.styles().unselected().setBorderLeft("1px solid rgba(0, 0, 0, 0.15)")
        this.applyStyles()
        this.setIsRegisteredForClicks(true)
        this.setAcceptsFirstResponder(true)
        this._rows = []

        this.setUserSelect("none")
        this.addGestureRecognizer(PinchGestureRecognizer.clone()) // for pinch open to add row
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

    willAddSubview: function (aSubview) {
        // for subclasses to over-ride
        if(!this._rows.contains(aSubview)) {
            //console.warn("")
            //this._rows.append(aSubview)
        }
    },

    willRemoveSubview: function (aSubview) {
        // for subclasses to over-ride
        if(!this._rows.contains(aSubview)) {
            //console.warn("")
        }
    },

    managedSubviews: function() {
        return this.rows()
    },

    removeAllManagedSubviews: function() {
        this._rows = []
        NodeView.removeAllManagedSubviews.apply(this)
        return this
    },

    addManagedSubviews: function(subviews) {
        NodeView.addManagedSubviews.apply(this, [subviews])
        //this.rows().appendItems(subviews)
        return this
    },
    
    rows: function() {
        return this.subviews()
        //return this._rows
    },

    addRow: function(v) {
        //this._rows.append(v)
        return this.addSubview(v)
    },

    removeRow: function(v) {
        //this._rows.remove(v)
        return this.removeSubview(v)
    },
    
    // rows
    /*
    rows: function() {
        return this.subviews()
    },

    addRow: function(v) {
        return this.addSubview(v)
    },

    removeRow: function(v) {
        return this.removeSubview(v)
    },
    */


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
        let row = this.rowWithNode(aNode)
        if (!row) {
            throw new Error("column  missing row for node '" + aNode.title() + "'")
        }
        this.didClickRow(row)
        return this
    },
    
    unselectRowsBesides: function(selectedRow) {
        let rows = this.rows()

        // unselect all other rows
        rows.forEach((row) => {
            if (row != selectedRow) {
                if (row.unselect) {
                    row.unselect()
                } else {
                    console.warn(this.type() + " found a row of type " + row.type() + " that doesn't respond to unselect")
                }
            }
        })
        
        return this
    },
    
    requestSelectionOfRow: function(aRow) {
        return this.didClickRow(aRow)
    },
    
    didClickRow: function(clickedRow) {
        this.unselectRowsBesides(clickedRow)

        /*
        // follow it if we can 
        if (clickedRow.nodeRowLink()) {
		    //console.log(this.typeId() + ".didClickRow(" + clickedRow.node().title() + ") selecting column ", this.node().title())
        //	this.browser().selectColumn(this)
        }
        */
        
        this.browser().selectColumn(this)
        return true
    },
    
    rowRequestsAddColumnForNode: function(aNode) {
    },
  
    selectedRows: function() {
        return this.rows().filter((row) => { 
            if (!row.isSelected) {
                console.warn("===== missing isSelected method on row of type: ", row.type())
                return false
            }
            return row.isSelected(); 
        })
    },

    selectedRow: function() {
        return this.selectedRows()[0]
    },
    
    selectedNode: function() {
        let row = this.selectedRow()
        return row ? row.node() : null
    },
    
    selectedRowIndex: function() {
        return this.rows().indexOf(this.selectedRow())
    },
    
    setSelectedRowIndex: function(index) {
        let oldIndex = this.selectedRowIndex()
        //console.log("this.setSelectedRowIndex(" + index + ") oldIndex=", oldIndex)
        if (index != oldIndex) {
            let rows = this.rows()
            if (index < rows.length && index > -1) {
                let row = rows[index]
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
        let index = this.indexOfRowWithNode(aNode);
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
        let selectedRow = this.rows().detect(row => row.node() === aNode)
		
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
        let row = this.selectedRow()
        if (row) { 
            return row.title().innerHTML() 
        }
        return null
    },

    // --- sync -----------------------------

    subviewProtoForSubnode: function(aSubnode) {
        let proto = aSubnode.nodeRowViewClass()
		
        if (!proto) {
            proto = BrowserTitledRow
        }
				
        return proto      
    },

    setNode: function(aNode) {
        if (this.node() !== aNode) {
            NodeView.setNode.apply(this, [aNode])
            this.unselectAllRows() // move to didChangeNode
            //"shouldFocusSubnode"
        }
        return this
    },
	
    shouldFocusSubnode: function(aNote) {
	    let subnode = aNote.info()
	    this.clickRowWithNode(subnode)

	    let subview = this.subviewForNode(subnode)
	    
        if (!subview) {
            this.syncFromNode()
	        subview = this.subviewForNode(subnode)
        } 

        if (subview) {
	        let subview = this.subviewForNode(subnode)
		    this.selectRowWithNode(subnode)
		    subview.scrollIntoView()
		    //subview.dynamicScrollIntoView()
        } else {
            console.warn("BrowserColumn for node " + this.node().typeId() + " has no matching subview for shouldFocusSubnode " + subnode.typeId())
            //console.log("row nodes = ", this.rows().map(row => row.node().typeId()) )
	    }

	    return this 
    },
	
    scrollToSubnode: function(aSubnode) {
	    //console.log(this.typeId() + ".scrollToSubnode")
	    let subview = this.subviewForNode(aSubnode)
	    assert(subview)
	    this.columnGroup().scrollView().setScrollTop(subview.offsetTop())
	    return this 	    
    },
    
    scrollToBottom: function() {
        let last = this.rows().last()

        if (last) { 
            last.scrollIntoView()
        }

        return this
    },

    didChangeNode: function() {
        NodeView.didChangeNode.apply(this)

        if (this.node() && this.node().nodeRowsStartAtBottom()) {
            setTimeout(() => { this.scrollToBottom() }, 0)
            //this.row().last().scrollIntoView()
        }

        return this
    },
	
    scheduleSyncFromNode: function() {
        if (this.browser() === null || this.node() === null) {
            /*
            console.warn("WARNING: skipping BrowserColumn.scheduleSyncFromNode")
            console.warn("  this.browser() = " , this.browser())
            console.warn("  this.node() = " , this.node())
            */
            return this
        }	    
	    NodeView.scheduleSyncFromNode.apply(this)
	    return this
    },
	
    syncFromNode: function () {
        
        /*
        if (this.browser() === null) {
            console.warn("WARNING: skipping BrowserColumn.syncFromNode because this.browser() is null")
            console.warn("this.node() = " , this.node())
            //console.warn("this.node().title() = " , this.node().title())
            return
        }
        */
        
        // remember the selection        
        let selectedIndex = this.selectedRowIndex()
        // console.log(this.node().title() + "  selectedIndex 1: " + selectedIndex)
        let thereWasASelection = selectedIndex !== -1
        let lastSelectedNode = this.selectedNode()
        
        NodeView.syncFromNode.apply(this)
        
        if (this.node() === null) {
            this.setIsRegisteredForDrop(false)
            return
        }
        
        this.setIsRegisteredForDrop(this.node().acceptsFileDrop())

        if (!thereWasASelection) {
            this.browser().clearColumnsGroupsAfter(this.columnGroup())
        } else {
 
            // select the row matching the last selected node
            let row = this.selectRowWithNode(lastSelectedNode)

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
                    let row = this.rows()[selectedIndex]
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
		
        let pc = this.previousColumn()	
        if (pc) {		
            if (this.selectedRow()) { 
                this.selectedRow().unselect() 
            }
			
            let newSelectedRow = pc.selectedRow()
            newSelectedRow.setShouldShowFlash(true).updateSubviews()
            pc.didClickRow(newSelectedRow)
        	this.selectPreviousColumn()
        }
        return false
    },
	
    onRightArrowKeyUp: function(event) {
        if (!this.canNavigate()) { return }	

        if (this.nextColumn() && this.nextColumn().rows().length > 0) {
        	this.selectNextColumn()
        }
        return false
    },	
	
    // --- enter key begins row editing ---------------------------
	
    onEnterKeyUp: function(event) {
        //console.log(this.typeId() + ".onEnterKeyUp()")
        
        if (!this.canNavigate()) { return }
	
        let row = this.selectedRow()
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
        let sNode = this.selectedNode()
        if (sNode && sNode.hasAction("delete")) { 
			sNode.performAction("delete") 
			if (this.rows().length === 0) {
				this.selectPreviousColumn()
			}
		}
		*/
        return false
    },
	
    onPlusKeyUp: function(event) {
        if (!this.canNavigate()) { return }		

        let sNode = this.selectedNode()
        if (sNode && sNode.hasAction("add")) { 
            let newNode = sNode.performAction("add") 
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
        
        let si = this.selectedRowIndex()

        //console.log(this.typeId() + ".selectNextRow(), selectedRowIndex:" + this.selectedRowIndex() + "/" + this.rows().length)

        let rows = this.rows()
        if (si === -1) {
            this.setSelectedRowIndex(0)
        } else {
            this.setSelectedRowIndex(si + 1)
        }
        return this
    },
    
    selectPreviousRow: function() {
        let si = this.selectedRowIndex()
        //let rows = this.rows()
        if (si === -1) {
            this.setSelectedRowIndex(0)
        } else {
            this.setSelectedRowIndex(si - 1)
        }
        return this
    },

    // next column
    
    nextColumn: function() {
        let i = this.columnIndex()
        let nextColumn = this.browser().columns()[i+1]
        return nextColumn
    },

    focus: function() {
        NodeView.focus.apply(this)
		
	    if (this.selectedRowIndex() === -1) {
            this.setSelectedRowIndex(0)
        }

        //console.log(this.typeId() + " focus")
        return this
    },
    
    selectNextColumn: function() {
        let nextColumn = this.nextColumn()
        if (nextColumn) {
            this.blur()
            //console.log("nextColumn.focus()")
            nextColumn.focus()
        }
        return this
    },
    
    // previous column
	
    previousColumn: function() {
        let i = this.columnIndex()
        let prevColumn = this.browser().columns()[i-1]
        return prevColumn
    },

    selectPreviousColumn: function() {
        //this.log("selectPreviousColumn this.columnIndex() = " + this.columnIndex())
        let prevColumn = this.previousColumn()
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
        let subviews = this.browser().columns().subviewsBefore(this)
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
        let maxWidth = this.rows().maxValue(function(row) {
            return row.calcWidth()
        })			
        return maxWidth	
    },

    // editing

    onDoubleClick: function (event) {
        //console.log(this.typeId() + ".onDoubleClick()")
        return true
    },

    // reordering support

    absolutePositionRows: function() {
        //console.log("absolutePositionRows")
        let ys = []
        this.rows().forEach((row) => {
            let y = row.relativePos().y()
            ys.append(y)
        })

        let i = 0
        this.rows().forEach((row) => {
            let y = ys[i]
            i ++
            row.setDisplay("block")
            row.setPosition("absolute")
            row.setTop(y)
            //console.log("i" + i + " : y" + y)
        })
        
        return this
    },

    relativePositionRows: function() {
        // should we calc a new subview ordering based on sorting by top values?
        let orderedRows = this.rows().copy().sortPerform("top")

        orderedRows.forEach((row) => {
            let y = row.relativePos().y()
            row.setPosition("relative")
            row.setDisplay("inline")
            row.setTop(null)
        })

        //this.removeAllSubviews()
        this.removeAllSubviews()
        this.addSubviews(orderedRows)
        //this.addManagedSubviews(orderedRows)
        return this
    },

    orderRows: function() {
        let orderedRows = this.rows().copy().sortPerform("top")

        this.rows().forEach((row) => {
            row.setPosition("absolute")
            row.setDisplay("block")
        })

        this.removeAllSubviews()
        this.addSubviews(orderedRows)
        return this
    },

    stackRows: function() {
        let orderedRows = this.rows().copy().sortPerform("top")

        let y = 0
        //console.log("stackRows")
        orderedRows.forEach((row) => {
            let h = row.clientHeight() 
            row.setPosition("absolute")
            row.setDisplay("block")
            //console.log("y:", y + " h:", h)
            row.setTop(y)
            y += h + 0
        })

        return this
    },

    canReorder: function() {
        return this.node().nodeCanReorder()
    },

    didReorderRows: function() { 
        // TODO: make a more scaleable API
        let subnodes = this.rows().map(row => row.node())
        this.node().nodeReorderSudnodesTo(subnodes)
        return this
    },

    // pinch

    rowContainingPoint: function(aPoint) {
        return this.rows().detect((row) => {
            return row.winBounds().containsPoint(aPoint)
        })
    },

    onPinchBegin: function(aGesture) {
        // if node supports add actions:
        // - calc insert index
        // - create new subnode,
        // - move it to insert index 
        // - sync with node to add row view for it
        // - set new row view height to zero and 
        //   reference it with _temporaryPinchSubnode so we
        //   can delete it if pinch doesn't complete with enough height

        console.log(this.typeId() + ".onPinchBegin()")
        let p = aGesture.beginCenterPosition()
        let r = this.rowContainingPoint(p)
        if (!r) {
            r = this.rowContainingPoint(p)
            return this
        }
        let insertIndex = this.rows().indexOf(r)

        //console.log("insertIndex: ", insertIndex)

        if (this.node().hasAction("add")) {
            let newSubnode = this.node().add()
            let subnodes = this.node().subnodes().copy()
            console.log("subnodes1: ", subnodes.map(v => v.typeId()))
            subnodes.remove(newSubnode)
            console.log("insertIndex:", insertIndex)
            subnodes.atInsert(insertIndex, newSubnode)
            console.log("subnodes2: ", subnodes.map(v => v.typeId()))

            let subviews = this.subviews()
            console.log("subviews before sync: ", subviews.map(sv => sv.node().typeId()))
            this.node().nodeReorderSudnodesTo(subnodes)
            this.syncFromNode()
            console.log("subviews after sync:  ", subviews.map(sv => sv.node().typeId()))

            let newRow = this.subviewForNode(newSubnode)
            if (!newRow) {
                newRow = this.subviewForNode(newSubnode)
            }
            newRow.setMinAndMaxHeight(0)

            this._temporaryPinchSubnode = newSubnode
        } else {
            aGesture.cancel()
        }        
    },
    
    onPinchMove: function(aGesture) {
        let s = Math.floor(aGesture.spread())
        console.log(this.typeId() + ".onPinchMove() spread = " + s)

        if (this._temporaryPinchSubnode) {
            let newRow = this.subviewForNode(this._temporaryPinchSubnode)
            if (!newRow) {
                newRow = this.subviewForNode(this._temporaryPinchSubnode)
            }
            newRow.setMinAndMaxHeight(s)
        }

        // adjust size of temporary row and positions of other rows
        // have temp row content max at normal size but outer view streatch to pinch size
        // restack all views
    },

    onPinchCompleted: function(aGesture) {
        console.log(this.typeId() + ".onPinchCompleted()")
        // if pinch is tall enough, keep new row, sync with 
    },

    onPinchCancelled: function(aGesture) {
        console.log(this.typeId() + ".onPinchCancelled()")
        if (this._temporaryPinchSubnode) {
            this.node().removeSubnode(this._temporaryPinchSubnode)
            this._temporaryPinchSubnode = null
        }
    },

})

