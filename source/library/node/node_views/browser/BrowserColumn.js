"use strict"

/* 

    BrowserColumn

*/

NodeView.newSubclassNamed("BrowserColumn").newSlots({
    rows: null,
    allowsCursorNavigation: true,
    defaultRowStyles: null,
    rowStyles: null,
    //shouldDarkenUnselected: true,
    rowPlaceHolder: null,
    hasPausedSync: false,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        //this.setIsDebugging(true)
        this.setIsRegisteredForKeyboard(true)
        //this.styles().selected().setBorderLeft("1px solid rgba(0, 0, 0, 0.15)")
        //this.styles().unselected().setBorderLeft("1px solid rgba(0, 0, 0, 0.15)")
        this.applyStyles()
        //this.setIsRegisteredForClicks(true) // use tap gesture instead
        this.setAcceptsFirstResponder(true)

        this.setUserSelect("none")
        this.addGestureRecognizer(PinchGestureRecognizer.clone()) // for pinch open to add row
        this.addGestureRecognizer(TapGestureRecognizer.clone()) // for pinch open to add row

        this.setRowStyles(BMViewStyles.clone().setToWhiteOnBlack())
        //this.rowStyles().selected().setBackgroundColor("red")
        return this
    },

    setRowBackgroundColor: function(aColor) {
        this.rowStyles().unselected().setBackgroundColor(aColor)
        return this
    },

    setRowSelectionColor: function(aColor) {
        this.rowStyles().selected().setBackgroundColor(aColor)
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
        return this.columnGroup().browser()
    },
    
    columnGroup: function () {
        return this.parentView().parentView()
    },
    
    // subviews

    /*
    hasRow: function(aRow) {
        return this.hasSubview(aRow)
    },
    */

    willAddSubview: function (aSubview) {
        // for subclasses to over-ride
        //if(!this.hasRow(aSubview)) {
        //console.warn("")
        //}
    },

    willRemoveSubview: function (aSubview) {
        // for subclasses to over-ride
        //if(!this.hasRow(aSubview)) {
        //console.warn("")
        //}
    },

    // --- rows ---
    
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

    darkenUnselectedRows: function() {
        const darkenOpacity = 0.5
        this.rows().forEach((row) => {
            if (row.isSelected()) {
                row.setOpacity(1)
            } else {
                row.setOpacity(darkenOpacity)
            }
        })
        return this
    },

    undarkenAllRows: function() {
        this.rows().forEach((row) => {
            row.setOpacity(1)
        })
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
                    //console.warn("=WARNING= " + this.typeId() + ".unselectRowsBesides() row " + row.typeId() + " missing unselect method")
                }
            }
        })
        
        return this
    },
    
    requestSelectionOfRow: function(aRow) {
        this.didClickRow(aRow)
        return true
    },
    
    didClickRow: function(clickedRow) {
        this.unselectRowsBesides(clickedRow)

        /*
        if (this.shouldDarkenUnselected()) {
            if (this.selectedRows().length > 0) {
                this.darkenUnselectedRows()
            } else {
                this.undarkenAllRows()
            }
        }
        */

        /*
        // follow it if we can 
        if (clickedRow.nodeRowLink()) {
		    //console.log(this.typeId() + ".didClickRow(" + clickedRow.node().title() + ") selecting column ", this.node().title())
        //	this.browser().selectColumn(this)
        }
        */
        
        this.selectThisColumn()
        return true
    },

    selectThisColumn: function() {
        if (Type.isNull(this.browser())) {
            console.log(this.typeId() + " selectThisColumn WARNING: this.browser() === null" )
            // TODO: find out why this happens
            return this
        }
        this.browser().selectColumn(this)
        return this
    },
    
    rowRequestsAddColumnForNode: function(aNode) {
    },
  
    selectedRows: function() {
        return this.rows().filter((row) => { 
            if (!row.isSelected) {
                //console.warn("=WARNING= " + this.typeId() + ".selectedRows() row " + row.typeId() + " missing isSelected method")
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
        this.rows().forEach(row => { if (row.unselect) { row.unselect()} })
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
            //this.clickRowWithNode(subnode)
            //subview.requestSelection()
            subview.scrollIntoView()
            if (this.previousColumn()) {
                this.previousColumn().selectThisColumn()
            }
            //this.selectThisColumn()
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
        if (this.hasPausedSync()) {
            return this
        }

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
            this.browser().clearColumnsGroupsAfter(this.columnGroup()) // TODO: fragile: careful that this doesn't cause a loop...
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

    onKeyUp: function(event) {
        //console.log(this.typeId() + " onKeyDown ", event)

        NodeView.onKeyUp.apply(this, [event])
        //console.log(this.typeId() + ".onKeyUp ", event)
        if (event.altKey) {
            const keyName = Keyboard.shared().nameForKeyCode(event.keyCode)
            if (keyName === "c") {

            }
        }
    }, 

    isInspecting: function() {
        // see if the row that selected this column is being inspected
        const prev = this.previousColumn() 
        if (prev) {
            const row = prev.selectedRow()
            if (row) {
                return row.isInspecting()
            }
        }
        return false
    },

    /*
    onControl_i_KeyUp: function(event) {
        // forward method to selected row and resync next column 
        console.log(this.typeId() + ".onControl_i_KeyUp()")

        const row = this.selectedRow()
        if (row) {
            const result = row.onControl_i_KeyUp(event)
            const nextColumn = this.nextColumn()
            if (nextColumn) {
                nextColumn.scheduleSyncFromNode()
            }
            return result
        }
    },
    */

    onControl_d_KeyUp: function(event) {
        //console.log(this.typeId() + ".onControl_d_KeyUp()")
        // duplicate?
        const node = this.node()
        const row = this.selectedRow()
        const canAdd = node.canSelfAddSubnode() 
        if (row && canAdd) {
            const canDuplicate = !Type.isNullOrUndefined(row.node().duplicate)
            if (canDuplicate) { 
                console.log(this.typeId() + " duplicate selected row " + this.selectedRow().node().title())
                const dup = row.node().duplicate()
                node.addSubnode(dup)
                this.scheduleSyncFromNode()
            }
        }
    },

    onControl_c_KeyUp: function(event) {
        // copy?
    },

    onControl_p_KeyUp: function(event) {
        // paste?
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
        }

        return false
    },

    // --- keyboard controls, add and delete actions -----------------------------

    /*
    deleteSelectedRow: function() {
        let sNode = this.selectedNode()
        if (sNode && sNode.canDelete()) { 
			sNode.performAction("delete") 
			if (this.rows().length === 0) {
				this.selectPreviousColumn()
			}
		}
    },
    */

    onDeleteKeyUp: function(event) {
        if (!this.canNavigate()) { return }
        //this.deleteSelectedRow()
        return false
    },
	
    onPlusKeyUp: function(event) {
        if (!this.canNavigate()) { return }		

        const sNode = this.selectedNode()
        if (sNode && sNode.hasAction("add")) { 
            const newNode = sNode.performAction("add") 
            this.selectNextColumn()
            if (this.nextColumn()) {
                this.nextColumn().selectRowWithNode(newNode)
            }
        }
        return false		
    },
	
    // -----------------------------
    
    onTapComplete: function(aGesture) {
        //console.log(this.typeId() + ".onTapComplete()")
        if (this.node()) {
            // add a subnode if tapping on empty area
            // make sure tap isn't on a row
            const p = aGesture.downPosition() // there may not be an up position on windows?
            //console.log(this.typeId() + ".onTapComplete() ", aGesture.upEvent())
            if (p.event().target === this.element()) {
                if (this.node().canSelfAddSubnode()) {
                    this.node().add()
                }
            }
        }
        return this
    },

    // -----------------------------

    columnIndex: function() {
        return this.browser().columnGroups().indexOf(this.columnGroup())
    },

    // nextRow

    selectFirstRow: function() {
        this.setSelectedRowIndex(0)
        return this
    },

    firstRow: function() {
        if (this.rows().length > 0) {
            return this.rows()[0]
        }
        return null
    },

    nextRow: function() {
        const si = this.selectedRowIndex()
        if (si !== -1 && si < this.rows().length) {
            const nextRow = this.rows()[si +1]
            return nextRow
        }
        return null
    },

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
        if(!this.browser()) {
            return null
        }
        const i = this.columnIndex()
        const previousColumn = this.browser().columns()[i - 1]
        return previousColumn
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
        const maxWidth = this.rows().maxValue((row) => row.calcWidth())			
        return maxWidth	
    },

    // editing

    onDoubleClick: function (event) {
        //console.log(this.typeId() + ".onDoubleClick()")
        return true
    },

    // reordering support

    absolutePositionRows: function() {
        const ys = []
        this.rows().forEach((row) => {
            const y = row.relativePos().y()
            ys.append(y)
        })

        let i = 0
        this.rows().forEach((row) => {
            const y = ys[i]
            i ++
            row.setDisplay("block")
            row.setPosition("absolute")
            row.setTop(y)
            row.setLeft(0)
            row.setRight(null)
            row.setBottom(null)
            row.setWidthPercentage(100)
            //console.log("i" + i + " : y" + y)
        })
        
        return this
    },


    /*
    orderRows: function() {
        const orderedRows = this.rows().shallowCopy().sortPerform("top")

        this.rows().forEach((row) => {
            row.setPosition("absolute")
            row.setDisplay("block")
        })

        this.removeAllSubviews()
        this.addSubviews(orderedRows)
        return this
    },
    */

    // -- stacking rows ---

    stackRows: function() {
        // we don't need to order rows not for 1st call of stackRows, 
        // but we do when calling stackRows while moving a drop view around,
        // so just always do it as top is null, and rows are already ordered the 1st time

        const orderedRows = this.rows().shallowCopy().sortPerform("top") 

        let y = 0
        
        const columnWidth =  this.computedWidth()
        
        orderedRows.forEach((row) => {
            let h = 0

            if (row.visibility() === "hidden" || row.display() === "none") {
                row.setDisplay("none")
            } else {
                h = row.computedHeight() //row.clientHeight() 
                row.setDisplay("block")
                row.setPosition("absolute")
                
                const w = columnWidth   //row.clientWidth() //row.computedWidth() // don't work, why?

                row.setMinAndMaxWidth(w).setMinAndMaxHeight(h)                
            }

            //console.log("y:", y + " h:", h)
            row.setTop(y)
            y += h
        })

        return this
    },

    unstackRows: function() {
        // should we calc a new subview ordering based on sorting by top values?
        const orderedRows = this.rows().shallowCopy().sortPerform("top")

        orderedRows.forEach((row) => {
            row.setDisplay("block")
            row.setPosition("relative")

            row.setTop(null)
            row.setLeft(null)
            row.setRight(null)
            row.setBottom(null)

            //row.unlockSize()
            row.setMinAndMaxWidth(null).setMinAndMaxHeight(null)                

        })

        this.removeAllSubviews()
        this.addSubviews(orderedRows)
        return this
    },

    // --------------

    canReorderRows: function() {
        return this.node().nodeCanReorderSubnodes()
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
            return row.frameInDocument().containsPoint(aPoint)
        })
    },


    onPinchBegin: function(aGesture) {
        // TODO: move row specific code to BrowserRow

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
            newRow.contentView().setTransition("all 0s")
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
            let s = Math.floor(aGesture.spreadY())
            if (s < 0) {
                s = 0
            }
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

    selectNextKeyView: function() {
        const nextRow = this.nextRow()
        if (nextRow) {
            this.selectNextRow()
            nextRow.becomeKeyView()
        } else {
            const firstRow = this.firstRow()
            if (firstRow) {
                this.selectFirstRow()
                firstRow.becomeKeyView()
            }
        }
        return this
    },

    // -- messages sent by DragView to the parent/owner of the view it's dragging ---

    onDragSourceBegin: function(aDragView) {
        this.setHasPausedSync(true)

        const subview = aDragView.item()
        subview.hideForDrag()
        const index = this.indexOfSubview(subview)
        assert(index !== -1)
        this.moveSubviewToIndex(this.newRowPlaceHolder(), index)
        this.columnGroup().cache() // only needed for source column, since we might navigate while dragging
        this.stackRows()
        return this
    },

    onDragSourceCancelled: function(aDragView) {
        aDragView.item().unhideForDrag()
        this.removeRowPlaceHolder()
    },

    onDragSourceEnter: function(dragView) {
        this.onDragDestinationHover(dragView)
    },

    onDragSourceHover: function(dragView) {
        this.onDragDestinationHover(dragView)
    },

    onDragSourceExit: function(dragView) {
        this.onDragDestinationHover(dragView)
    },

    onDragSourceDropped: function(dragView) {
        const dv = dragView.item()
        this.unstackRows()
        this.swapSubviews(dv, this.rowPlaceHolder())
        this.removeRowPlaceHolder()
        dv.unhideForDrag()
    },

    onDragSourceEnd: function(aDragView) {
        this.columnGroup().scheduleMethod("uncache")
        this.endDropMode()
    },

    // -- messages sent by DragView to the potential drop view, if not the source ---

    acceptsDropHover: function(aDragView) {
        if (this.node()) {
            if (!aDragView) {
                console.log("aDragView.item() missing")
            }
            const typeOk = this.node().acceptsAddingSubnode(aDragView.item().node())
            return typeOk && this.canReorderRows()
        }
        return false
    },

    newRowPlaceHolder: function() {
        this.debugLog("newRowPlaceHolder")
        if (!this.rowPlaceHolder()) {
            const ph = DomView.clone().setDivClassName("BrowserRowPlaceHolder")
            ph.setBackgroundColor("black")
            ph.setMinAndMaxWidth(this.computedWidth())
            ph.setMinAndMaxHeight(64)
            //ph.transitions().at("top").updateDuration(1)
            //ph.transitions().at("left").updateDuration(0.3)
            ph.setTransition("top 0s, left 0.3s, max-height 1s, min-height 1s")
            this.addSubview(ph)
            this.setRowPlaceHolder(ph)
        }
        return this.rowPlaceHolder()
    },


    // --- drag destination ---

    onDragDestinationEnter: function(dragView) {
        this.setHasPausedSync(true)

        // insert place holder view
        if (!this.rowPlaceHolder()) {
            this.newRowPlaceHolder()
            this.rowPlaceHolder().setMinAndMaxHeight(dragView.computedHeight())
            this.onDragDestinationHover(dragView)
        }
    },

    onDragDestinationHover: function(dragView) {
        // move place holder view
        const ph = this.rowPlaceHolder()
        if (ph) {
            const vp = this.viewPosForWindowPos(dragView.dropPoint())
            const y = vp.y() - dragView.computedHeight()/2
            ph.setTop(vp.y() - dragView.computedHeight()/2)
            this.stackRows() // need to use this so we can animate the row movements
        }
    },
    
    onDragDestinationExit: function(dragView) {
        this.endDropMode()
    },

    onDragDestinationEnd: function(aDragView) {
        this.endDropMode()
    },

    acceptsDropHoverComplete: function(aDragView) {
        return this.acceptsDropHover(aDragView);
    },

    dropCompleteDocumentFrame: function() {
        return this.rowPlaceHolder().frameInDocument()
    },

    onDragDestinationDropped: function(dragView) {
        const dv = dragView.item()

        this.unstackRows()
 
        // move a view between parents
        if(dv.onDragRequestRemove && dv.onDragRequestRemove()) {
            assert(dv.hasParentView() === false)
            //this.addSubnode(dv.node()) // this happens automatically with didReorderSubviews?
            this.addSubview(dv)

            dv.setPosition("absolute")
            dv.setTop(this.rowPlaceHolder().top())

            assert(dv.hasParentView()) //
            this.swapSubviews(dv, this.rowPlaceHolder())
            this.removeRowPlaceHolder()

            dv.unhideForDrag()
        }

        this.endDropMode()
        assert(dv.hasParentView())
    },

    removeRowPlaceHolder: function() {
        this.debugLog("removeRowPlaceHolder")

        const ph = this.rowPlaceHolder()
        if (ph) {
            //console.log("removeRowPlaceHolder")
            this.removeSubview(ph)
            this.setRowPlaceHolder(null)
        }
    },

    animateRemoveRowPlaceHolderAndThen: function(callback) {
        this.debugLog("animateRemoveRowPlaceHolder")

        const ph = this.rowPlaceHolder()
        if (ph) {
            ph.setMinAndMaxHeight(0)
            setTimeout(() => {
                this.removeRowPlaceHolder()
                if (callback) { callback() }
            }, 1*1000)
        } else {
            if (callback) { callback() }
        }
    },

    endDropMode: function() {
        this.debugLog("endDropMode")
        this.unstackRows()
        this.removeRowPlaceHolder()
        this.unstackRows()
        this.setHasPausedSync(false)
        this.didReorderRows()

        /*
        this.animateRemoveRowPlaceHolderAndThen(() => {
         this.debugLog("endDropMode")
            this.unstackRows()
            this.setHasPausedSync(false)
            this.didReorderRows()
        })
        */

        return this
    },

    /*
    rowIndexForViewportPoint: function(aPoint) {
        if (this.rows().length === 0) {
            return 0
        }

        const row = this.rows().detect((row) => {
            return row.frameInDocument().containsPoint(aPoint)
        })

        if (row) {
            return this.rows().indexOf(row)
        }

        return this.rows().length
    },
    */

})

