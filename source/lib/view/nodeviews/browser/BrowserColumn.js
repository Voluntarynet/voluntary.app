"use strict"

/* 

    BrowserColumn

*/

window.BrowserColumn = NodeView.extend().newSlots({
    type: "BrowserColumn",
    rows: null,
    selectionColor: "#aaa",
    allowsCursorNavigation: true,
    isDebugging: true,
    defaultRowStyles: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setIsRegisteredForKeyboard(true)
        //this.styles().selected().setBorderLeft("1px solid rgba(0, 0, 0, 0.15)")
        //this.styles().unselected().setBorderLeft("1px solid rgba(0, 0, 0, 0.15)")
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
    
    // subviews

    hasRow: function(aRow) {
        return this._rows.contains(aRow)
    },

    willAddSubview: function (aSubview) {
        // for subclasses to over-ride
        if(!this.hasRow(aSubview)) {
            //console.warn("")
            //this._rows.append(aSubview)
        }
    },

    willRemoveSubview: function (aSubview) {
        // for subclasses to over-ride
        if(!this.hasRow(aSubview)) {
            //console.warn("")
        }
    },

    // --- managedSubviews ---

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

    // --- rows ---
    
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
        return this.rows().detect(row => row.node() === aNode)
    },
    
    didClickRowWithNode: function(aNode) {
        const row = this.rowWithNode(aNode)
        if (!row) {
            throw new Error("column  missing row for node '" + aNode.title() + "'")
        }
        this.didClickRow(row)
        return this
    },
    
    unselectRowsBesides: function(selectedRow) {
        const rows = this.rows()

        // unselect all other rows
        rows.forEach((row) => {
            if (row !== selectedRow) {
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
        const row = this.selectedRow()
        return row ? row.node() : null
    },
    
    selectedRowIndex: function() {
        return this.rows().indexOf(this.selectedRow())
    },
    
    setSelectedRowIndex: function(index) {
        const oldIndex = this.selectedRowIndex()
        //console.log("this.setSelectedRowIndex(" + index + ") oldIndex=", oldIndex)
        if (index !== oldIndex) {
            const rows = this.rows()
            if (index < rows.length && index !== -1) {
                const row = rows[index]
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
        const index = this.indexOfRowWithNode(aNode);
        if (index !== null) {
            this.setSelectedRowIndex(index)
        }
        return this
    },

    unselectAllRows: function() {
        this.rows().forEach(row => row.unselect())
        return this
    },
	
    selectRowWithNode: function (aNode) {
        const selectedRow = this.rows().detect(row => row.node() === aNode)
		
        if (selectedRow) {
            selectedRow.setIsSelected(true)
			
            this.rows().forEach((aRow) => {
                if (aRow !== selectedRow) {
                    aRow.unselect()
                }
            })
        }

        return selectedRow
    },
    
    selectedRowTitle: function () {
        const row = this.selectedRow()
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
	    const subnode = aNote.info()
	    this.clickRowWithNode(subnode)

	    let subview = this.subviewForNode(subnode)
	    
        if (!subview) {
            this.syncFromNode()
	        subview = this.subviewForNode(subnode)
        } 

        if (subview) {
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
	    const subview = this.subviewForNode(aSubnode)
	    assert(subview)
	    this.columnGroup().scrollView().setScrollTop(subview.offsetTop())
	    return this 	    
    },
    
    scrollToBottom: function() {
        const last = this.rows().last()

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
    
    /*
    scheduleSyncFromNode: function() {
        if (this.browser() === null || this.node() === null) {
            console.warn("WARNING: skipping BrowserColumn.scheduleSyncFromNode")
            console.warn("  this.browser() = " , this.browser())
            console.warn("  this.node() = " , this.node())
            return this
        }	    
	    NodeView.scheduleSyncFromNode.apply(this)
	    return this
    },
    */
	
    syncFromNode: function () {
        
        if (this.browser() === null) {
            // must have been removed from parentView
            //console.warn("WARNING: skipping BrowserColumn.syncFromNode on node '" + this.node().typeId() + "' because this.browser() is null")
            //console.warn("this.node().title() = " , this.node().title())
            return
        }
        
        
        // remember the selection before sync
        let selectedIndex = this.selectedRowIndex()
        const lastSelectedNode = this.selectedNode()
        
        NodeView.syncFromNode.apply(this)
        
        if (this.node() === null) {
            this.setIsRegisteredForDrop(false)
            return this
        }
        
        this.setIsRegisteredForDrop(this.node().acceptsFileDrop())

        if (selectedIndex === -1) {
            this.browser().clearColumnsGroupsAfter(this.columnGroup())
        } else {
            // select the row matching the last selected node

            let row = this.selectRowWithNode(lastSelectedNode)

            if (row) {
                // there's a row for the lastSelectedNode, so let's select it
                if (!row.isSelected()) {
                    //this.log("selecting row titled '" + row.title().innerHTML() + "'")
                    row.setIsSelected(true)
                    this.didClickRow(row)
                }
            } else {
                if (this.rows().length) {
                    // otherwise, select close to last selected index
                    const i = Math.min(selectedIndex, this.rows().length - 1)
                    row = this.rows()[i]
                    //this.log("selecting row titled '" + row.title().innerHTML() + "'")
                    row.setIsSelected(true)
                    this.didClickRow(row)
                }
            }
        }
    },

    // --- keyboard controls, arrow navigation -----------------------------

    canNavigate: function() {
        return this.allowsCursorNavigation() 
        //return this.allowsCursorNavigation() && this.isActiveElement()
    },
	
    showSelected: function() {
        /*
        TODO: add check if visible
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

    moveLeft: function() {
        const pc = this.previousColumn()	
        if (pc) {
            if (this.selectedRow()) { 
                this.selectedRow().unselect() 
            }
			
            const newSelectedRow = pc.selectedRow()
            newSelectedRow.setShouldShowFlash(true).updateSubviews()
            pc.didClickRow(newSelectedRow)
        	this.selectPreviousColumn()
        }
        return this
    },

    moveRight: function() {
        if (this.nextColumn() && this.nextColumn().rows().length > 0) {
        	this.selectNextColumn()
        }

        return this
    },
	
    onLeftArrowKeyUp: function(event) {
        if (!this.canNavigate()) { 
            return this
        }	

        this.moveLeft()
    },
	
    onRightArrowKeyUp: function(event) {
        if (!this.canNavigate()) { 
            return this
        }	

        this.moveRight()
    },	
	
    // --- enter key begins row editing ---------------------------
	
    onEnterKeyUp: function(event) {
        //console.log(this.typeId() + ".onEnterKeyUp()")
        
        if (!this.canNavigate()) { return }
	
        const row = this.selectedRow()
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

        const sNode = this.selectedNode()
        if (sNode && sNode.hasAction("add")) { 
            const newNode = sNode.performAction("add") 
	        this.selectNextColumn()
            this.nextColumn().selectRowWithNode(newNode)
        }
        return false		
    },
	
    // -----------------------------
    
    columnIndex: function() {
        return this.browser().columnGroups().indexOf(this.columnGroup())
    },

    // nextRow

    selectNextRow: function() {
        const si = this.selectedRowIndex()
        if (si === -1) {
            this.setSelectedRowIndex(0)
        } else {
            this.setSelectedRowIndex(si + 1)
        }
        return this
    },
    
    selectPreviousRow: function() {
        const si = this.selectedRowIndex()
        if (si === -1) {
            this.setSelectedRowIndex(0)
        } else {
            this.setSelectedRowIndex(si - 1)
        }
        return this
    },

    // next column
    
    nextColumn: function() {
        const i = this.columnIndex()
        const nextColumn = this.browser().columns()[i+1]
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
        const nextColumn = this.nextColumn()
        if (nextColumn) {
            this.blur()
            //console.log("nextColumn.focus()")
            nextColumn.focus()
        }
        return this
    },
    
    // previous column
	
    previousColumn: function() {
        const i = this.columnIndex()
        const prevColumn = this.browser().columns()[i - 1]
        return prevColumn
    },

    selectPreviousColumn: function() {
        //this.log("selectPreviousColumn this.columnIndex() = " + this.columnIndex())
        const prevColumn = this.previousColumn()
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
        const maxWidth = this.rows().maxValue(function(row) {
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
        const ys = []
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
        const orderedRows = this.rows().copy().sortPerform("top")

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
        const orderedRows = this.rows().copy().sortPerform("top")

        this.rows().forEach((row) => {
            row.setPosition("absolute")
            row.setDisplay("block")
        })

        this.removeAllSubviews()
        this.addSubviews(orderedRows)
        return this
    },

    stackRows: function() {
        const orderedRows = this.rows().copy().sortPerform("top")

        let y = 0
        //console.log("stackRows")
        orderedRows.forEach((row) => {
            const h = row.clientHeight() 
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
        const subnodes = this.rows().map(row => row.node())
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
        //console.log(this.typeId() + ".onPinchBegin()")

        // - calc insert index
        const p = aGesture.beginCenterPosition()
        const row = this.rowContainingPoint(p)
        if (!row) {
            // don't allow pinch if it's bellow all the rows
            // use a tap gesture to create a row there instead?
            return this
        }

        const insertIndex = this.rows().indexOf(row)

        //console.log("insertIndex: ", insertIndex)

        if (this.node().hasAction("add")) {
            // create new subnode at index
            const newSubnode = this.node().addAt(insertIndex)

            // reference it with _temporaryPinchSubnode so we
            // can delete it if pinch doesn't complete with enough height
            this._temporaryPinchSubnode = newSubnode

            // sync with node to add row view for it
            this.syncFromNode()

            // find new row and prepare it
            const newRow = this.subviewForNode(newSubnode)
            newRow.setMinAndMaxHeight(0)
            newRow.contentView().setMinAndMaxHeight(64)
            newRow.setTransition("all 0s")
            newRow.setBackgroundColor("black")

            // set new row view height to zero and 
            const minHeight = BrowserRow.defaultHeight()
            const cv = newRow.contentView()
            cv.setBackgroundColor(this.columnGroup().backgroundColor())
            cv.setMinAndMaxHeight(minHeight)
            //newRow.scheduleSyncFromNode()
            //this._temporaryPinchSubnode.didUpdateNode()
        } else {
            //console.log(this.typeId() + ".onPinchBegin() cancelling due to no add action")

            aGesture.cancel()
        }        
    },
    
    onPinchMove: function(aGesture) {
        if (this._temporaryPinchSubnode) {
            const s = Math.floor(aGesture.spread())
            //console.log(this.typeId() + ".onPinchMove() s = ", s)
            const minHeight = BrowserRow.defaultHeight()
            const newRow = this.subviewForNode(this._temporaryPinchSubnode)
            //newRow.setBackgroundColor("black")
            newRow.setMinAndMaxHeight(s)
            const t = Math.floor(s/2 - minHeight/2);
            newRow.contentView().setTop(t)

            const h = BrowserRow.defaultHeight()

            if (s < h) {
                const f = s/h;
                const rot = Math.floor((1 - f) * 90);
                newRow.setPerspective(1000)
                newRow.setTransformOrigin(0)
                //newRow.contentView().setTransformOriginPercentage(0)
                newRow.contentView().setTransform("rotateX(" + rot + "deg)")
                const z = -100 * f;
                //newRow.contentView().setTransform("translateZ(" + z + "dg)")
            } else {
                newRow.setPerspective(null)
                newRow.contentView().setTransform(null)                
            }
        } else {
            console.warn(this.typeId() + ".onPinchMove() missing this._temporaryPinchSubnode")
        }
        // do we need to restack views?
    },

    onPinchComplete: function(aGesture) {
        //console.log(this.typeId() + ".onPinchCompleted()")
        // if pinch is tall enough, keep new row

        if (this._temporaryPinchSubnode) {
            const newRow = this.subviewForNode(this._temporaryPinchSubnode)
            const minHeight = BrowserRow.defaultHeight()
            if (newRow.clientHeight() < minHeight) {
                this.removeRow(newRow)
            } else {
                newRow.contentView().setTransition("all 0.15s")
                newRow.setTransition("all 0.3s")
                setTimeout(() => { 
                    newRow.contentView().setTop(0)
                    newRow.setMinAndMaxHeight(minHeight) 
                }, 0)
            }

            this._temporaryPinchSubnode = null
        }
    },

    onPinchCancelled: function(aGesture) {
        //console.log(this.typeId() + ".onPinchCancelled()")
        if (this._temporaryPinchSubnode) {
            this.node().removeSubnode(this._temporaryPinchSubnode)
            this._temporaryPinchSubnode = null
        }
    },

})

