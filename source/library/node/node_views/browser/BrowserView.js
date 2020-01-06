"use strict"

/*
    
    BrowserView

    A Miller Column browser. It's subviews are BrowserColumnGroups.
    Each BrowserColumnGroup has a ColumnHeader, ScrollView, and ColumnFooter.
    Within a BrowserColumnGroup ScrollView is BrowserColumn whose subviews are BrowserRows.
    
*/

window.BrowserView = class BrowserView extends NodeView {
    
    initPrototype () {
        this.newSlot("columns", null)
        this.newSlot("isSingleColumn", false)
        this.newSlot("defaultHeader", null)
        this.newSlot("defaultColumnStyles", null)
        this.newSlot("defaultRowStyles", null)
        this.newSlot("watchForNodeUpdates", false)

        // dict of nodes, with node.typeId() as key, and BrowserColumnGroup as value
        this.newSlot("columnGroupCache", null)
    }

    init () {
        super.init()

        this.setupDefaultStyles()
        this.setColumnGroupCache({})

        this.setIsRegisteredForDocumentResize(true)

        const dh = DomView.clone().setDivClassName("BrowserDefaultHeader NodeView DomView")
        this.setDefaultHeader(dh)
        this.addSubview(dh)

        this.setBackgroundColor(this.bgColorForIndex(Math.round(this.bgColors().length / 2)))
        this.setColumnGroupCount(1)
        //this.selectFirstColumn()

        this.addGestureRecognizer(LeftEdgePanGestureRecognizer.clone()) 
        this.addGestureRecognizer(RightEdgePanGestureRecognizer.clone()) 

        return this
    }

    bgColors () {
        //return this.bgColorsCool()
        //return this.bgColorsWarm()
        return this.bgColorsGray()
        //return this.bgColorsWhite()
    }

    bgColorsWhite () {
        return [
            [255, 255, 255],
        ]
    }

    bgColorsGray () {
        return [
            //[64/255, 64/255, 64/255],
            [60 / 255, 60 / 255, 60 / 255],
            [48 / 255, 48 / 255, 48 / 255],
            [32 / 255, 32 / 255, 32 / 255],
            [26 / 255, 26 / 255, 26 / 255],
            [16 / 255, 16 / 255, 16 / 255],
            //[0 / 255, 0 / 255, 0 / 255],
        ] //.reversed()
    }

    bgColorsWarm () {
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
    }

    bgColorsCool () {
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
    }


    // columnGroupCache

    hasCachedColumnGroup(cg) {
        return Object.values(this.columnGroupCache()).contains(cg)
    }

    getCachedColumnGroupForNode (node) {
        const k = node.typeId()
        const cg = this.columnGroupCache()[k]
        return cg
    }

    cacheColumnGroup (cg) {
        assert(cg.type() === "BrowserColumnGroup")
        const k = cg.node().typeId()
        this.columnGroupCache().atPut(k, cg)
        return this
    }

    uncacheColumnGroup (cg) {
        assert(cg.type() === "BrowserColumnGroup")
        const k = cg.node().typeId()
        this.columnGroupCache().removeAt(k) 
        //console.log("uncacheColumnGroup ", cg.node().title())
        //this.scheduleSyncFromNode() // needed?
        return this
    }

    // edge pan

    onRightEdgePanBegin (aGesture) {
        // TODO: animate this until complete
        //console.log("onRightEdgePanBegin")
        //if(this.isSingleColumn()) {
        const column = this.selectedColumn()
        if (column) {
            column.moveRight()
        }
        //}
        aGesture.cancel()
    }


    // left screen edge pan

    canMoveLeft () {
        return this.activeColumnGroups().length > 1
    }

    onLeftEdgePanBegin (aGesture) {
        console.log("onScreenLeftEdgePanBegin")
        console.log("  this.activeColumnGroups().length = ", this.activeColumnGroups().length)

        if (this.canMoveLeft()) {
            this.previous()
        }
        aGesture.cancel()
    }

    // -------------------


    setupDefaultStyles () {
        this.setDefaultColumnStyles(BMViewStyles.clone())
        this.defaultColumnStyles().unselected().setBackgroundColor("white")
        this.defaultColumnStyles().selected().setBackgroundColor("white")

        this.setDefaultRowStyles(BMViewStyles.clone())
        this.defaultRowStyles().unselected().setColor("#aaa")
        this.defaultRowStyles().selected().setColor("white")
        return this
    }

    updateBackground () {
        const n = this.activeColumnGroups().length
        this.setBackgroundColor(this.bgColorForIndex(n + 1))
    }

    // --- resizing ---------------------------------

    onDocumentResize (event) {
        //this.debugLog(" onDocumentResize")
        this.fitColumns()
        if (this._selectedColumnGroup) {
            this.selectColumn(this._selectedColumnGroup.column())
        }
        return this
    }

    updateSingleColumnMode () {
        //console.log("---")
        //const size = DocumentBody.zoomAdjustedSize()
        //const w = WebBrowserScreen.shared().orientedWidth()
        //const h = WebBrowserScreen.shared().orientedHeight()
        //console.log("WebBrowserScreen size = " + w + "x" + h)

        const size = WebBrowserScreen.shared().lesserOrientedSize()
        const w = size.width
        const h = size.height
        let r = 1

        if (w < 900 && WebBrowserWindow.shared().isOnMobile()) {
            //console.log("w = " , w)
            //console.log("((900 - w)/100) = ", ((900 - w)/100))
            r = 1 + ((900 - w) / 100) * 0.3
        }

        if (r > 3) {
            r = 3
        }
        //console.log("r = " + r)


        //console.log("lesserOrientedSize: " + w + "x" + h + " setZoomRatio(" + r + ")") 
        //DocumentBody.setZoomRatio(r) // turning this off to see if it fixes mobile tiny fonts

        const isSingle = ((w < h) && (w < 800)) || (w < 400)
        //console.log("isSingle = ", isSingle)
        this.setIsSingleColumn(isSingle) 

        // for debugging window resizing
        //WebBrowserWindow.shared().setTitle(size.width + " x " + size.height + " " + (isSingle ? "single" : "multi"))

        //console.log("---")
        return this
    }

    // --- columns -------------------------------

    columnGroups () {
        return this.subviews().select(subview => subview.isKindOf(BrowserColumnGroup) ) // TODO: is this still neeeded?
    }

    addColumnGroup (v) {
        return this.addSubview(v)
    }

    removeColumnGroup (v) {
        return this.removeSubview(v)
    }

    columns () {
        return this.columnGroups().map((cg) => { return cg.column() })
    }

    // --- column background colors ----------------------------

    bgColorForIndex (i) {
        let colors = this.bgColors()
        const rcolors = this.bgColors().reversed()
        rcolors.removeFirst()
        colors = colors.shallowCopy().appendItems(rcolors)

        const rgb = colors[i % colors.length]

        const s = "rgb(" + rgb.map((v) => { return Math.round(v * 255) }).join(", ") + ")"
        //console.log("bgColorForIndex = '" + s + "'")
        return s
    }

    setupColumnGroupColors () {
        let i = 0

        this.columnGroups().forEach((cg) => {
            if (cg.column().type() === "BrowserColumn") { // TODO: don't depend on type
                let bgColor = this.bgColorForIndex(i)

                if (cg.node()) {
                    let color = cg.node().nodeColumnBackgroundColor()
                    if (color) {
                        //console.log("found  nodeColumnBackgroundColor " + color + " for ", cg.node().typeId() + " " + cg.node().title())
                        bgColor = color
                    } else {
                        //console.log("no nodeColumnBackgroundColor for ", cg.node().typeId() + " " + cg.node().title())
                    }
                }

                //cg.styles().selected().setBackgroundColor(bgColor)
                //cg.styles().unselected().setBackgroundColor(bgColor)
                //this.defaultColumnStyles().selected().applyToView(cg)
                cg.setBackgroundColor(bgColor)
                cg.column().setRowBackgroundColor(bgColor)
                cg.column().setRowSelectionColor(this.bgColorForIndex(i + 1))
            }
            i ++
        })

        return this
    }

    activeColumnGroups () {
        return this.columnGroups().select(cg => cg.node() !== null)
    }

    newBrowserColumnGroup () {
        return BrowserColumnGroup.clone().setBrowser(this).colapse()
    }

    setColumnGroupCount (count) {
        //this.log("setColumnGroupCount " + count)
        if (count === 0) {
            Error.showCurrentStack()
        }

        if (this.columnGroups().length === count) { // redundant?
            return this
        }

        /*
		// collapse excess columns
        for (let i = count; i < this.columnGroups().length - 1; i ++) {
            this.columnGroups().at(i).collpase()
        }
        */

        // remove any excess columns
        while (this.columnGroups().length > count) {
            this.removeColumnGroup(this.columnGroups().last())
        }

        //this.clearColumnsGroupsAfterIndex(count -1)

        // add columns as needed
        while (this.columnGroups().length < count) {
            const newCg = this.newBrowserColumnGroup()
            this.addColumnGroup(newCg)
        }

        //this.updateColumnPositions()
        this.setupColumnGroupColors()
        //this.log("this.columnGroups().length = " + this.columnGroups().length)
        //assert(this.columnGroups().length  === count)
        return this
    }

    /*
    useNewColumnGroupToReplaceColumnGroupAtIndex (index) {
        const cgs = this.columnGroups()
        const oldCg = cgs[index]
        const newCg = this.newBrowserColumnGroup()
        this.replaceSubviewWith(oldCg, newCg)
        return newCg
    }
    */

    clearColumnsGroupsAfterIndex (index) {
        const cgs = this.columnGroups()
        for (let i = index + 1; i < cgs.length; i++) {
            const cg = cgs.at(i)
            //cg.setNode(null).syncFromNode()
            //this.useNewColumnGroupToReplaceColumnGroupAtIndex(i)
            if (!Type.isNull(cg.node())) {
                //console.log("clearing column group ", i)
                const theCg = this.setColumnGroupAtIndexToNode(i, null)
                theCg.syncFromNode() // causes loop as the last column will clear columns after it 
            }
        }
        //console.log("---")

        return this
    }

    clearColumnsGroupsAfter (selectedCg) {
        const cgs = this.columnGroups()
        const index = cgs.indexOf(selectedCg)
        this.clearColumnsGroupsAfterIndex(index)
    }

    // --- get selected column ---------------------------------------

    selectedColumnGroup () {
        return this.columnGroups().detect(cg => cg.isSelected())
    }

    selectedColumn () {
        const cg = this.selectedColumnGroup()
        if (cg) {
            return cg.column()
        }
        return null
    }

    // --- select column ---------------------------------------

    selectFirstColumn () {
        this.selectColumn(this.columns().first())
        return this
    }


    updateSelectedColumnTo (selectedColumn) {
        const selectedColumnGroup = selectedColumn.columnGroup()
        this.columnGroups().forEach(cg => cg.setIsSelected(cg === selectedColumnGroup))
        this.syncToHashPath()
        return this
    }

    previous () {
        this.popLastActiveColumn()
        return this
    }

    popLastActiveColumn () {
        //console.log("popLastActiveColumn this.activeColumnGroups().length = ", this.activeColumnGroups().length)
        let n = this.activeColumnGroups().length - 1
        if (n < 0) { n = 0; }
        this.setColumnGroupCount(n) // TODO: collapse cg instead?
        this.fitColumns()
        this.syncToHashPath()
        return this
    }

    setColumnGroupAtIndexToNode (cgIndex, cgNode) {
        const oldCg = this.columnGroups()[cgIndex]

        if (oldCg.node() !== cgNode) {
            if (cgNode) {
                const cachedCg = this.getCachedColumnGroupForNode(cgNode)
                if (cachedCg && oldCg != cachedCg) {
                    assert(cachedCg.type() === "BrowserColumnGroup") // sanity check
                    this.replaceSubviewWith(oldCg, cachedCg)
                    cachedCg.copySetupFrom(oldCg)
                    return cachedCg
                }  
            }
            
            const newCg = this.newBrowserColumnGroup().setNode(cgNode)
            this.replaceSubviewWith(oldCg, newCg)
            newCg.copySetupFrom(oldCg)
            return newCg
        }

        return oldCg
    }

    selectColumn (selectedColumn) {

        /*
        if (this.selectedColumn() === selectedColumn) {
            return this
        }
        */

        const selectedColumnGroup = selectedColumn.columnGroup()
        this._selectedColumnGroup = selectedColumnGroup

        const index = this.columnGroups().indexOf(selectedColumn.columnGroup())

        //this.debugLog(" selectColumn " + selectedColumn.node().type() + " index " + index)

        if (this.isSingleColumn()) {
            this.setColumnGroupCount(index + 2)
        } else {
            this.setColumnGroupCount(index + 3)
        }

        //console.log("selectColumn index: " + index + " cg " + this.columnGroups().length)

        let nextCg = this.columnGroups().itemAfter(selectedColumnGroup)

        if (nextCg) {
            const selectedRow = selectedColumnGroup.column().selectedRow()

            selectedColumnGroup.matchNodeMinWidth() // testing

            if (selectedRow) {
                const nextNode = selectedRow.nodeRowLink() // returns receiver by default
                //console.log("selectedRow title:  ", selectedRow.node().title())

                if (nextNode) {
                    //console.log("nextNode:  ", nextNode.title())
                    
                    if (nextCg.node() !== nextNode) { // need a way to use columnGroupCache
                        nextCg = this.setColumnGroupAtIndexToNode(nextCg.index(), nextNode)
                    }
                    
                    nextCg.setNode(nextNode)
                    //nextCg.scheduleSyncFromNode()
                    
                    this.clearColumnsGroupsAfter(nextCg)

                    if ((nextNode.viewClassName() !== "BrowserColumnGroup") || nextNode.isKindOf(BMFieldSetNode)) { // TODO: use a better rule here
                        this.setColumnGroupCount(index + 2)
                    }
                    
                }
                else {
                    this.clearColumnsGroupsAfter(selectedColumnGroup)
                }
            }
        }

        this.setupColumnGroupColors()
        this.fitColumns()
        this.updateSelectedColumnTo(selectedColumn)
        return this
    }

    didClickRow (row) {
        console.log("Browser didClickRow ", row)
        // columns intercept this, so we don't get this message anymore
        return true
    }

    syncFromNode () {
        //this.log("syncFromNode")
        const columnGroups = this.columnGroups()

        //columnGroups.first().setNode(this.node())
        this.setColumnGroupAtIndexToNode(0, this.node())

        //console.log(this.type() + ".syncFromNode()")

        columnGroups.forEach((cg) => {
            cg.syncFromNode()
        })

        this.setupColumnGroupColors()
        this.fitColumns()
        return this
    }

    clipToColumnGroup (cg) {
        const index = this.columnGroups().indexOf(cg)
        this.setColumnGroupCount(index + 1)
        return this
    }

    // --- width --------------------------

    widthOfColumnGroups () {
        return this.columnGroups().sum(cg => cg.minWidth())
    }

    // --- collapsing column groups -----

    lastActiveColumnGroup () {
        return this.columnGroups().reversed().detect(cg => cg.column().node() != null)
    }

    // --- fitting columns in browser ---------------------------------------------

    fitColumns () {
        //this.debugLog(".fitColumns()")
        this.updateSingleColumnMode()

        const lastActiveCg = this.lastActiveColumnGroup()

        //console.log("this.isSingleColumn(): ", this.isSingleColumn())

        if (lastActiveCg && this.isSingleColumn()) {
            this.fitForSingleColumn()
        } else {
            this.fitForMultiColumn()
        }

        return this
    }

    updateBackArrow () {
        this.columnGroups().forEach(cg => cg.updateBackArrow())
        return this
    }

    makeLastActiveColumnFillRemainingSpace () {
        // TODO: merge with this code in multi column fit
        const lastActiveCg = this.lastActiveColumnGroup()
        const fillWidth = (this.browserWidth() - this.left()) - this.widthOfUncollapsedColumnsSansLastActive()


        if (lastActiveCg) {
            lastActiveCg.setFlexGrow(1)
            lastActiveCg.setFlexShrink(1)
            lastActiveCg.setFlexBasis(fillWidth)
            lastActiveCg.setMinAndMaxWidth(fillWidth)
        }
        return this
    }

    fitForSingleColumn () {
        const lastActiveCg = this.lastActiveColumnGroup()

        this.columnGroups().forEach((cg) => {
            if (cg !== lastActiveCg) {
                cg.setFlexGrow(0)
                cg.setIsCollapsed(true)
                cg.setMinAndMaxWidth(0)
            }
        })

        lastActiveCg.setIsCollapsed(false)
        this.makeLastActiveColumnFillRemainingSpace()
        this.updateBackArrow()
        //console.log("fitForSingleColumn")
        this.setShouldShowTitles(true)
        //console.log("lastActiveCg.node().title() = ", lastActiveCg.node().title(), " width ", lastActiveCg.minWidth(), " ", lastActiveCg.maxWidth())

        return this
    }

    uncollapsedColumns () {
        return this.activeColumnGroups().select(cg => !cg.isCollapsed())
    }

    widthOfUncollapsedColumns () {
        return this.uncollapsedColumns().sum(cg => cg.targetWidth())
    }

    widthOfUncollapsedColumnsSansLastActive () {
        const lastActiveCg = this.lastActiveColumnGroup()
        const cgs = this.uncollapsedColumns()
        cgs.remove(lastActiveCg)
        return cgs.sum(cg => cg.targetWidth())
    }

    setShouldShowTitles (aBool) {
        this.columnGroups().forEach(cg => cg.header().setShouldShowTitle(aBool) )
        return this
    }

    columnDescription () {
        let d = this.columnGroups().map((cg) => {
            if (cg.isCollapsed()) { return "" }
            let s = cg.name()
            if (cg.node() === null) { s += " [null node] " }
            //s += " " + (cg.isCollapsed() ? "collapsed" : "uncollapsed")
            s += " " + this.pxNumberToString(cg.targetWidth())
            return s
        }).join(" / ")

        d += " [" + this.widthOfUncollapsedColumns() + " of " + this.browserWidth() + "]"
        return d
    }


    fitForMultiColumn () {
        this.updateBackground()
        this.uncollapseAllColumns()
        this.collapseLeftColumnsUntilRightColumnsFit()
        this.expandLastColumnIfNeeded()
        this.updateBackArrow()
        this.setShouldShowTitles(false) // only show titles in single column mode
        //console.log(this.columnDescription())

        this.uncollapsedColumns().forEach(column => column.fitToTargetWidth())
        return this
    }

    uncollapseAllColumns () {
        this.columnGroups().forEach((cg) => {
            cg.setIsCollapsed(false)
            //console.log(cg.name() + " targetWidth: " + cg.targetWidth())
        })
        return this
    }

    collapseLeftColumnsUntilRightColumnsFit () {
        const lastActiveCg = this.lastActiveColumnGroup()
        const browserWidth = this.browserWidth()
        // collapse columns from left to right until they all fit
        this.columnGroups().forEach((cg) => {
            const usedWidth = this.widthOfUncollapsedColumns()
            let shouldCollapse = (usedWidth > this.browserWidth()) && (cg !== lastActiveCg)
            shouldCollapse = shouldCollapse || (cg.node() === null)
            //console.log(cg.name() + " shouldCollapse:" + shouldCollapse + " usedWidth: " + usedWidth + " browserWidth:" + this.browserWidth())
            cg.setIsCollapsed(shouldCollapse)
        })
        return this
    }

    expandLastColumnIfNeeded () {
        const lastActiveCg = this.lastActiveColumnGroup()

        if (lastActiveCg) {
            let fillWidth = (this.browserWidth() - this.left()) - this.widthOfUncollapsedColumnsSansLastActive()
            if (lastActiveCg.targetWidth() * 2 < fillWidth && lastActiveCg.targetWidth() < 500) {
                fillWidth = lastActiveCg.targetWidth()
            }
            
            //console.log("fillWidth = ", fillWidth)
            lastActiveCg.setFlexGrow(1)
            lastActiveCg.setFlexShrink(1)
            lastActiveCg.setFlexBasis(fillWidth)
            lastActiveCg.setMinAndMaxWidth(fillWidth)
        }
    }

    // -----------------------------------------------

    browserWidth () {
        return this.clientWidth()
    }

    windowWidth () {
        return App.shared().mainWindow().width()
    }

    // --- node paths -----------------------------

    selectNode (aNode) {
        //console.log("selectNode " + aNode.nodePath())
        if (!aNode) {
            console.warn(this.type() + " selectNode called with null argument")
            Error.showCurrentStack()
            return this
        }
        this.selectNodePath(aNode.nodePath())
        return this
    }

    selectNodePath (nodePathArray) {
        //this.debugLog(".selectNodePath(" + nodePathArray.map((node) => { return node.title() }).join("/")  + ")")
        //this.debugLog(".selectNodePath() current path: " + this.nodePathString())
        this.setColumnGroupCount(1)

        let column = this.columns().first()

        if (nodePathArray.first() === column.node()) {
            //console.log("selectNodePath removeFirst column " + column.node().title())
            nodePathArray.removeFirst()
        }

        //this.debugLog(".selectNodePath() selecting path " + nodePathArray.map((node) => { return node.title() }).join("/") )

        nodePathArray.forEach((node) => {
            //console.log("clicking node " + (node ? node.title() : null))
            if (node) {
                column.selectRowWithNode(node)

                //column.didClickRowWithNode(node)

                //column.clickRowWithNode(node)
                //column.selectNextColumn()
                this.selectColumn(column)
                column = column.nextColumn()
            }
        })

        //this.syncFromNode()
    }

    nodeStringPath () {
    }

    nodePathArray () {
        return this.activeColumnGroups().map((cg) => { return cg.node() })
    }

    lastNode () {
        const cg = this.lastActiveColumnGroup()
        if (cg) {
            return cg.node()
        }
        return null
    }

    nodePath () {
        const lastNode = this.lastNode();
        if (lastNode) {
            return lastNode.nodePath();
        }
        return [];
    }

    nodePathString () {
        const lastNode = this.lastNode();
        if (lastNode) {
            return lastNode.nodePathString(); //.map((node) => { return node.title() }).join("/")
        }
        return ""
    }

    setNodePathComponents (nodePath) {
        this.setWatchForNodeUpdates(true);
        const lastNode = this.node().nodeAtSubpath(nodePath.slice(1));
        if (lastNode) {
            this.selectNode(lastNode);
        }
        return this;
    }

    setNodePathString (pathString) {
        return this.setNodePathComponents(pathString.split("/"));
    }

    // --- hash paths ------------------------------------- 

    performHashCommandIfPresent () {
        const hash = WebBrowserWindow.shared().urlHash()
        const commandString = hash.after(";")
        const command = HashCommand.clone().parseCommandString(commandString)
        const node = this.lastNode()
        command.setTarget(node).send()
        return this
    }

    syncFromHashPath () {
        const hash = WebBrowserWindow.shared().urlHash()
        let j = ""

        if (hash === "") {
            this.setNodePathComponents([""])
            return this
        }
        //console.log("hash = " + typeof(hash) + " " + hash)
        try {
            j = JSON.parse(hash)
        } catch(e) {
            console.warn("can't parse json in URL hash")
            return this
        }

        if (j) {
            const nodePath = j.path
            this.setNodePathComponents(nodePath)

            const method = j.method
            if (method) {
                let args = j.args ? j.args : []
                let target = this.lastNode()
                if (target) {
                    target.doHashCommand()
                }
            }
        }
        //console.log("hash: " + hash + "")
        /*
        let nodePathString = hash.before(";")
        this.setNodePathString(hash)
        this.performHashCommandIfPresent()
        */
        return this
    }

    syncToHashPath () {
        const hash = JSON.stringify({ path: this.nodePath().map(n => n.title()) });
        WebBrowserWindow.shared().setUrlHash(hash)
        return this
    }

    didUpdateNode () {
        if (this.watchForNodeUpdates()) {
            this.syncToHashPath();
        }
    }
    
}.initThisClass()
