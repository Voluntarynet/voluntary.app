"use strict"

/* 

    BrowserColumn

*/

window.BrowserColumn = class BrowserColumn extends NodeView {
    
    initPrototype () {
        this.newSlot("rows", null)
        this.newSlot("allowsCursorNavigation", true)
        this.newSlot("defaultRowStyles", null)
        this.newSlot("rowStyles", null)
        this.newSlot("rowPlaceHolder", null)
        this.newSlot("hasPausedSync", false)
        //shouldDarkenUnselected: true,
    }

    init () {
        super.init()
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

        this.setIsRegisteredForDrop(true)

        return this
    }

    setRowBackgroundColor (aColor) {
        this.rowStyles().unselected().setBackgroundColor(aColor)
        return this
    }

    setRowSelectionColor (aColor) {
        this.rowStyles().selected().setBackgroundColor(aColor)
        return this
    }

    applyStyles () {
        //this.debugLog(".applyStyles()")
        super.applyStyles()
        return this
    }
    
    title () {
        return this.node() ? this.node().title() : ""
    }

    browser () {
        return this.columnGroup().browser()
    }
    
    columnGroup () {
        return this.parentView().parentView()
    }
    
    // subviews

    /*
    hasRow (aRow) {
        return this.hasSubview(aRow)
    }
    */

    willAddSubview (aSubview) {
        // for subclasses to over-ride
        //if(!this.hasRow(aSubview)) {
        //console.warn("")
        //}
    }

    willRemoveSubview (aSubview) {
        // for subclasses to over-ride
        //if(!this.hasRow(aSubview)) {
        //console.warn("")
        //}
    }

    // --- rows ---
    
    rows () {
        return this.subviews()
    }

    addRow (v) {
        return this.addSubview(v)
    }

    removeRow (v) {
        return this.removeSubview(v)
    }


    // selection
	
    didChangeIsSelected () {
        super.didChangeIsSelected()

        if (this.isSelected()) {
            this.focus()
        } else {
            this.blur()
        }
		
        return this
    }

    darkenUnselectedRows () {
        const darkenOpacity = 0.5
        this.rows().forEach((row) => {
            if (row.isSelected()) {
                row.setOpacity(1)
            } else {
                row.setOpacity(darkenOpacity)
            }
        })
        return this
    }

    undarkenAllRows () {
        this.rows().forEach((row) => {
            row.setOpacity(1)
        })
    }

    rowWithNode (aNode) {
        return this.rows().detect(row => row.node() === aNode)
    }
    
    didClickRowWithNode (aNode) {
        const row = this.rowWithNode(aNode)
        if (!row) {
            throw new Error("column  missing row for node '" + aNode.title() + "'")
        }
        this.didClickRow(row)
        return this
    }
    
    unselectRowsBesides (selectedRow) {
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
    }
    
    requestSelectionOfRow (aRow) {
        this.didClickRow(aRow)
        return true
    }
    
    didClickRow (clickedRow) {
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
		    //this.debugLog(".didClickRow(" + clickedRow.node().title() + ") selecting column ", this.node().title())
        //	this.browser().selectColumn(this)
        }
        */
        
        this.selectThisColumn()
        return true
    }

    selectThisColumn () {
        if (Type.isNull(this.browser())) {
            this.debugLog(" selectThisColumn WARNING: this.browser() === null" )
            // TODO: find out why this happens
            return this
        }
        this.browser().selectColumn(this)
        return this
    }
    
    rowRequestsAddColumnForNode (aNode) {
    }
  
    selectedRows () {
        return this.rows().filter((row) => { 
            if (!row.isSelected) {
                //console.warn("=WARNING= " + this.typeId() + ".selectedRows() row " + row.typeId() + " missing isSelected method")
                return false
            }
            return row.isSelected(); 
        })
    }

    selectedRow () {
        return this.selectedRows()[0]
    }
    
    selectedNode () {
        const row = this.selectedRow()
        return row ? row.node() : null
    }
    
    selectedRowIndex () {
        return this.rows().indexOf(this.selectedRow())
    }
    
    setSelectedRowIndex (index) {
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
    }
  
    indexOfRowWithNode (aNode) {
        return this.rows().detectIndex(row => row.node() === aNode)
    }
    
    clickRowWithNode (aNode) {
        const index = this.indexOfRowWithNode(aNode);
        if (index !== null) {
            this.setSelectedRowIndex(index)
        }
        return this
    }

    unselectAllRows () {
        this.rows().forEach(row => { if (row.unselect) { row.unselect()} })
        return this
    }
	
    selectRowWithNode (aNode) {
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
    }
    
    selectedRowTitle () {
        const row = this.selectedRow()
        if (row) { 
            return row.title().innerHTML() 
        }
        return null
    }

    // --- sync -----------------------------

    subviewProtoForSubnode (aSubnode) {
        let proto = aSubnode.nodeRowViewClass()
		
        if (!proto) {
            proto = BrowserTitledRow
        }
				
        return proto      
    }

    setNode (aNode) {
        if (this.node() !== aNode) {
            super.setNode(aNode)
            this.unselectAllRows() // move to didChangeNode
            //"shouldFocusSubnode"
        }
        return this
    }
	
    shouldFocusSubnode (aNote) {
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
    }
	
    scrollToSubnode (aSubnode) {
	    //this.debugLog(".scrollToSubnode")
	    const subview = this.subviewForNode(aSubnode)
	    assert(subview)
	    this.columnGroup().scrollView().setScrollTop(subview.offsetTop())
	    return this 	    
    }
    
    scrollToBottom () {
        const last = this.rows().last()

        if (last) { 
            last.scrollIntoView()
        }

        return this
    }

    didChangeNode () {
        super.didChangeNode()

        if (this.node() && this.node().nodeRowsStartAtBottom()) {
            setTimeout(() => { this.scrollToBottom() }, 0)
            //this.row().last().scrollIntoView()
        }

        return this
    }
    
    /*
    scheduleSyncFromNode () {
        if (this.browser() === null || this.node() === null) {
            console.warn("WARNING: skipping BrowserColumn.scheduleSyncFromNode")
            console.warn("  this.browser() = " , this.browser())
            console.warn("  this.node() = " , this.node())
            return this
        }	    
	    super.scheduleSyncFromNode()
	    return this
    }
    */
	
    syncFromNode () {
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
        
        super.syncFromNode()
        
        if (this.node() === null) {
            this.setIsRegisteredForDrop(false)
            return this
        }
        
        //this.setIsRegisteredForDrop(this.node().acceptsFileDrop())

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
                    row = this.rows().at(i)
                    //this.log("selecting row titled '" + row.title().innerHTML() + "'")
                    row.setIsSelected(true)
                    this.didClickRow(row)
                }
            }
        }
    }

    // --- keyboard controls, arrow navigation -----------------------------

    canNavigate () {
        return this.allowsCursorNavigation() 
        //return this.allowsCursorNavigation() && this.isActiveElement()
    }
	
    showSelected () {
        /*
        TODO: add check if visible
        if (this.selectedRow()) {
            this.selectedRow().scrollIntoView()
        }
        */
        return this	    
    }

    //onMetaLeft_d_KeyUp (event) {
    onAlternate_d_KeyUp (event) {
        //this.debugLog(" onMetaLeft_d_KeyUp")
        this.duplicateSelectedRow()
        return false // stop propogation
    }

    isInspecting () {
        // see if the row that selected this column is being inspected
        const prev = this.previousColumn() 
        if (prev) {
            const row = prev.selectedRow()
            if (row) {
                return row.isInspecting()
            }
        }
        return false
    }

    /*
    onControl_i_KeyUp (event) {
        // forward method to selected row and resync next column 
        this.debugLog(".onControl_i_KeyUp()")

        const row = this.selectedRow()
        if (row) {
            const result = row.onControl_i_KeyUp(event)
            const nextColumn = this.nextColumn()
            if (nextColumn) {
                nextColumn.scheduleSyncFromNode()
            }
            return result
        }
    }
    */

    duplicateSelectedRow () {
        const node = this.node()
        const row = this.selectedRow()
        const canAdd = node.canSelfAddSubnode() 
        if (row && canAdd) {
            const canCopy = !Type.isNullOrUndefined(row.node().copy)
            if (canCopy) { 
                //this.debugLog(" duplicate selected row " + this.selectedRow().node().title())
                const subnode = row.node()
                const newSubnode = subnode.copy()
                const index = node.indexOfSubnode(subnode)
                node.addSubnodeAt(newSubnode, index)
                //node.addSubnode(newSubnode)
                this.scheduleSyncFromNode()
            }
        }
    }

    onControl_c_KeyUp (event) {
        // copy?
    }

    onControl_p_KeyUp (event) {
        // paste?
    }
	
    onUpArrowKeyUp (event) {
        if (!this.canNavigate()) { 
            return 
        }
        this.selectPreviousRow()
        this.showSelected()
        return false
    }
	
    onDownArrowKeyUp (event) {
        if (!this.canNavigate()) { 
            return 
        }
        this.selectNextRow()
        this.showSelected()
        return false
    }

    moveLeft () {
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
    }

    moveRight () {
        if (this.nextColumn() && this.nextColumn().rows().length > 0) {
        	this.selectNextColumn()
        }

        return this
    }
	
    onLeftArrowKeyUp (event) {
        if (!this.canNavigate()) { 
            return this
        }	

        this.moveLeft()
    }
	
    onRightArrowKeyUp (event) {
        if (!this.canNavigate()) { 
            return this
        }	

        this.moveRight()
    }
	
    // --- enter key begins row editing ---------------------------
	
    onEnterKeyUp (event) {
        //this.debugLog(".onEnterKeyUp()")
        
        if (!this.canNavigate()) { return }
	
        const row = this.selectedRow()
        if (row) { 
		    row.onEnterKeyUp(event)
        }

        return false
    }

    // --- keyboard controls, add and delete actions -----------------------------

    /*
    deleteSelectedRow () {
        let sNode = this.selectedNode()
        if (sNode && sNode.canDelete()) { 
			sNode.performAction("delete") 
			if (this.rows().length === 0) {
				this.selectPreviousColumn()
			}
		}
    }
    */

    onDeleteKeyUp (event) {
        if (!this.canNavigate()) { return }
        //this.deleteSelectedRow()
        return false
    }
	
    onPlusKeyUp (event) {
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
    }
	
    // -----------------------------
    
    onTapComplete (aGesture) {
        //this.debugLog(".onTapComplete()")
        if (this.node()) {
            // add a subnode if tapping on empty area
            // make sure tap isn't on a row
            const p = aGesture.downPosition() // there may not be an up position on windows?
            //this.debugLog(".onTapComplete() ", aGesture.upEvent())
            if (p.event().target === this.element()) {
                if (this.node().canSelfAddSubnode()) {
                    this.node().add()
                }
            }
        }
        return this
    }

    // -----------------------------

    columnIndex () {
        return this.browser().columnGroups().indexOf(this.columnGroup())
    }

    // nextRow

    selectFirstRow () {
        this.setSelectedRowIndex(0)
        return this
    }

    firstRow () {
        if (this.rows().length > 0) {
            return this.rows()[0]
        }
        return null
    }

    nextRow () {
        const si = this.selectedRowIndex()
        if (si !== -1 && si < this.rows().length) {
            const nextRow = this.rows()[si +1]
            return nextRow
        }
        return null
    }

    selectNextRow () {
        const si = this.selectedRowIndex()
        if (si === -1) {
            this.setSelectedRowIndex(0)
        } else {
            this.setSelectedRowIndex(si + 1)
        }
        return this
    }
    
    selectPreviousRow () {
        const si = this.selectedRowIndex()
        if (si === -1) {
            this.setSelectedRowIndex(0)
        } else {
            this.setSelectedRowIndex(si - 1)
        }
        return this
    }

    // next column
    
    nextColumn () {
        const i = this.columnIndex()
        const nextColumn = this.browser().columns()[i+1]
        return nextColumn
    }

    focus () {
        super.focus()
		
	    if (this.selectedRowIndex() === -1) {
            this.setSelectedRowIndex(0)
        }

        //this.debugLog(" focus")
        return this
    }
    
    selectNextColumn () {
        const nextColumn = this.nextColumn()
        if (nextColumn) {
            this.blur()
            //console.log("nextColumn.focus()")
            nextColumn.focus()
        }
        return this
    }
    
    // previous column
	
    previousColumn () {
        if(!this.browser()) {
            return null
        }
        const i = this.columnIndex()
        const previousColumn = this.browser().columns()[i - 1]
        return previousColumn
    }

    selectPreviousColumn () {
        //this.log("selectPreviousColumn this.columnIndex() = " + this.columnIndex())
        const prevColumn = this.previousColumn()
        if (prevColumn) {
            this.blur()
            prevColumn.focus()
            this.browser().selectColumn(prevColumn)
        }
        return this
    }

    // paths
    
    /*
    browserPathArray () {
        let subviews = this.browser().columns().subviewsBefore(this)
        subviews.push(this)
        return subviews
    }
    
    browserPathString () {
        return this.browserPathArray().map(function (column) { 
            return column.title()  // + ":" + column.node().type()
        }).join("/")
    }
    */

    logName () {
        return this.browserPathString()
    }

    maxRowWidth () {
        if (this.rows().length === 0) {
            return 0
        }
        
        const maxWidth = this.rows().maxValue(row => row.desiredWidth())			
        return maxWidth	
    }

    // editing

    onDoubleClick (event) {
        //this.debugLog(".onDoubleClick()")
        return true
    }

    // reordering support

    absolutePositionRows () {
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
    }


    /*
    orderRows () {
        const orderedRows = this.rows().shallowCopy().sortPerform("top")

        this.rows().forEach((row) => {
            row.setPosition("absolute")
            row.setDisplay("block")
        })

        this.removeAllSubviews()
        this.addSubviews(orderedRows)
        return this
    }
    */

    // -- stacking rows ---

    stackRows () {
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
    }

    unstackRows () {
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
    }

    // --------------

    canReorderRows () {
        return this.node().nodeRowLink().nodeCanReorderSubnodes()
        //return this.node().nodeCanReorderSubnodes()
    }

    didReorderRows () { 
        // TODO: make a more scaleable API
        const subnodes = this.rows().map(row => row.node())
        this.node().nodeRowLink().nodeReorderSudnodesTo(subnodes)
        //this.node().nodeReorderSudnodesTo(subnodes)
        return this
    }

    // pinch

    rowContainingPoint (aPoint) {
        return this.rows().detect((row) => {
            return row.frameInDocument().containsPoint(aPoint)
        })
    }


    onPinchBegin (aGesture) {
        // TODO: move row specific code to BrowserRow

        //this.debugLog(".onPinchBegin()")

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
            //this.debugLog(".onPinchBegin() cancelling due to no add action")

            aGesture.cancel()
        }        
    }
    
    onPinchMove (aGesture) {
        if (this._temporaryPinchSubnode) {
            let s = Math.floor(aGesture.spreadY())
            if (s < 0) {
                s = 0
            }
            //this.debugLog(".onPinchMove() s = ", s)
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
    }

    onPinchComplete (aGesture) {
        //this.debugLog(".onPinchCompleted()")
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
    }

    onPinchCancelled (aGesture) {
        //this.debugLog(".onPinchCancelled()")
        if (this._temporaryPinchSubnode) {
            this.node().removeSubnode(this._temporaryPinchSubnode)
            this._temporaryPinchSubnode = null
        }
    }

    selectNextKeyView () {
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
    }

    // -- messages sent by DragView to the parent/owner of the view it's dragging ---

    onDragSourceBegin (dragView) {
        this.setHasPausedSync(true)

        const subview = dragView.item()
        const index = this.indexOfSubview(subview)
        assert(index !== -1)

        this.newRowPlaceHolder()

        if (dragView.isMoveOp()) {
            subview.hideForDrag()
            this.moveSubviewToIndex(this.rowPlaceHolder(), index)
        }

        this.columnGroup().cache() // only needed for source column, since we might navigate while dragging
        this.stackRows()
        return this
    }

    onDragSourceCancelled (dragView) {
        dragView.item().unhideForDrag()
        this.removeRowPlaceHolder()
    }

    onDragSourceEnter (dragView) {
        this.onDragDestinationHover(dragView)
    }

    onDragSourceHover (dragView) {
        this.onDragDestinationHover(dragView)
    }

    onDragSourceExit (dragView) {
        this.onDragDestinationHover(dragView)
    }

    onDragSourceDropped (dragView) {
        const dv = dragView.item()
        this.unstackRows()

        if (dragView.isMoveOp()) {
            this.swapSubviews(dv, this.rowPlaceHolder())
        } else if (dragView.isCopyOp()) {
            const dupRow = dv.duplicate()
            this.node().addSubnode(dupRow.node())
            this.addSubview(dupRow)
            this.swapSubviews(dupRow, this.rowPlaceHolder())
        }

        this.removeRowPlaceHolder()
        dv.unhideForDrag()
    }

    onDragSourceEnd (dragView) {
        this.columnGroup().scheduleMethod("uncache")
        this.endDropMode()
    }

    // -- messages sent by DragView to the potential drop view, if not the source ---

    acceptsDropHover (dragView) {
        let node = this.node()
        if (node) {
            assert(dragView.item())

            let dropNode = dragView.item().node()
            let acceptsNode = node.acceptsAddingSubnode(dropNode)
            let canReorder = this.canReorderRows()
            //console.log(node.title() + " acceptsNode " + dropNode.title() + " " + acceptsNode)
            //console.log("parentNode " + node.parentNode().title())
            let result = acceptsNode && canReorder
            /*
            if (result === false) {
                console.log("false")
            }
            */
            return result
        }
        return false
    }

    newRowPlaceHolder () {
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
    }

    // --- drag destination ---

    onDragDestinationEnter (dragView) {
        this.setHasPausedSync(true)

        // insert place holder view
        if (!this.rowPlaceHolder()) {
            this.newRowPlaceHolder()
            this.rowPlaceHolder().setMinAndMaxHeight(dragView.computedHeight())
            this.onDragDestinationHover(dragView)
        }
    }

    onDragDestinationHover (dragView) {
        // move place holder view
        const ph = this.rowPlaceHolder()
        if (ph) {
            const vp = this.viewPosForWindowPos(dragView.dropPoint())
            const y = vp.y() - dragView.computedHeight()/2
            ph.setTop(vp.y() - dragView.computedHeight()/2)
            this.stackRows() // need to use this so we can animate the row movements
        }
    }
    
    onDragDestinationExit (dragView) {
        this.endDropMode()
    }

    onDragDestinationEnd (aDragView) {
        this.endDropMode()
    }

    acceptsDropHoverComplete (aDragView) {
        return this.acceptsDropHover(aDragView);
    }

    dropCompleteDocumentFrame () {
        return this.rowPlaceHolder().frameInDocument()
    }

    onDragDestinationDropped (dragView) {
        this.unstackRows()
 
        const itemView = dragView.item()
        if(itemView.onDragRequestRemove && itemView.onDragRequestRemove()) {
            const insertIndex = this.indexOfSubview(this.rowPlaceHolder())
            this.node().addSubnodeAt(itemView.node(), insertIndex)
            this.removeRowPlaceHolder()
        }

        this.setHasPausedSync(false)
        this.syncFromNode()
        //this.endDropMode() // we already unstacked the rows
    }

    /*
    // version that works with views instead of nodes

    onDragDestinationDropped (dragView) {
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
    }
    */

    removeRowPlaceHolder () {
        this.debugLog("removeRowPlaceHolder")

        const ph = this.rowPlaceHolder()
        if (ph) {
            //console.log("removeRowPlaceHolder")
            this.removeSubview(ph)
            this.setRowPlaceHolder(null)
        }
    }

    animateRemoveRowPlaceHolderAndThen (callback) {
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
    }

    endDropMode () {
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
    }

    /*
    rowIndexForViewportPoint (aPoint) {
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
    }
    */

    // Browser drop from desktop

    acceptsDrop () {
        return true
    }

    onDrop (event) {
        // triggered on drop target
        if (this.acceptsDrop()) {
            //const file = event.dataTransfer.files[0];
            //console.log('onDrop ' + file.path);
            //this.onDataTransfer(event.dataTransfer)
            this.debugLog(" got drop")
            const data = event.dataTransfer.getData("text");
            console.log("drop text = ", data)
            let json = null
            try {
                json = JSON.parse(data)
                
            } catch (error) {

            }
            
            this.dragUnhighlight()
            event.preventDefault();
            return true;
        }
        event.preventDefault();

        return false
    }
    
}.initThisClass()

