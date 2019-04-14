"use strict"

/*
    
    BrowserView
    
*/

window.BrowserView = NodeView.extend().newSlots({
    type: "BrowserView",
    columns: null,
    isSingleColumn: false,
    defaultHeader: null,
    defaultColumnStyles: null,
    defaultRowStyles: null,
    watchForNodeUpdates: false
}).setSlots({

    bgColors: function () {
        //return this.bgColorsCool()
        return this.bgColorsGray()
        //return this.bgColorsWhite()
    },

    bgColorsWhite: function () {
        return [
            [255, 255, 255],
        ]
    },

    bgColorsGray: function () {
        return [
            //[64/255, 64/255, 64/255],
            [60 / 255, 60 / 255, 60 / 255],
            [48 / 255, 48 / 255, 48 / 255],
            [32 / 255, 32 / 255, 32 / 255],
            [26 / 255, 26 / 255, 26 / 255],
            [16 / 255, 16 / 255, 16 / 255],
        ]
    },

    bgColorsWarm: function () {
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

    bgColorsCool: function () {
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

        this.setupDefaultStyles()

        this.setIsRegisteredForDocumentResize(true)

        let dh = DomView.clone().setDivClassName("BrowserDefaultHeader NodeView DomView")
        this.setDefaultHeader(dh)
        this.addSubview(dh)

        this.setBackgroundColor(this.bgColorForIndex(Math.round(this.bgColors().length / 2)))
        this.setColumnGroupCount(1)
        //.selectFirstColumn()

        this.addGestureRecognizer(ScreenLeftEdgePanGestureRecognizer.clone()) 
        this.addGestureRecognizer(ScreenRightEdgePanGestureRecognizer.clone()) 

        return this
    },

    // right screen edge pan

    onScreenRightEdgePanBegin: function(aGesture) {
        console.log("onScreenRightEdgePanBegin")
    },
    
    onScreenRightEdgePanMove: function(aGesture) {
        console.log("onScreenRightEdgePanMove")

    },

    onScreenRightEdgePanComplete: function(aGesture) {

    },

    onScreenRightEdgePanCancelled: function(aGesture) {

    },

    // left screen edge pan

    onScreenLeftEdgePanBegin: function(aGesture) {
        console.log("onScreenLeftEdgePanBegin")

    },

    onScreenLeftEdgePanMove: function(aGesture) {
        console.log("onScreenLeftEdgePanMove")

    },

    onScreenLeftEdgePanComplete: function(aGesture) {

    },

    onScreenLeftEdgePanCancelled: function(aGesture) {

    },


    setupDefaultStyles: function () {
        this.setDefaultColumnStyles(BMViewStyles.clone())
        this.defaultColumnStyles().unselected().setBackgroundColor("white")
        this.defaultColumnStyles().selected().setBackgroundColor("white")

        this.setDefaultRowStyles(BMViewStyles.clone())
        this.defaultRowStyles().unselected().setColor("#aaa")
        this.defaultRowStyles().selected().setColor("white")
        return this
    },

    updateBackground: function () {
        const n = this.activeColumnGroups().length
        this.setBackgroundColor(this.bgColorForIndex(n + 1))
    },

    prepareToSyncToView: function () {
        //console.log(this.typeId() + " prepareToSyncToView")
        NodeView.prepareToSyncToView.apply(this)
        this.fitColumns()
        return this
    },

    // --- resizing ---------------------------------

    onDocumentResize: function (event) {
        //console.log(this.typeId() + " onDocumentResize")
        this.fitColumns()
        if (this._selectedColumnGroup) {
            this.selectColumn(this._selectedColumnGroup.column())
        }
        return this
    },

    updateSingleColumnMode: function () {
        //console.log("---")
        //let size = DocumentBody.zoomAdjustedSize()
        //let w = WebBrowserScreen.shared().orientedWidth()
        //let h = WebBrowserScreen.shared().orientedHeight()
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
    },

    // --- columns -------------------------------

    columnGroups: function () {
        return this.subviews().select((subview) => { return subview.isKindOf(BrowserColumnGroup) })
    },

    addColumnGroup: function (v) {
        return this.addSubview(v)
    },

    removeColumnGroup: function (v) {
        return this.removeSubview(v)
    },

    columns: function () {
        return this.columnGroups().map((cg) => { return cg.column() })
    },

    // --- column background colors ----------------------------

    bgColorForIndex: function (i) {
        let colors = this.bgColors()
        const rcolors = this.bgColors().reversed()
        rcolors.removeFirst()
        colors = colors.copy().appendItems(rcolors)

        const rgb = colors.atModLength(i)
        const s = "rgb(" + rgb.map((v) => { return Math.round(v * 255) }).join(",") + ")"
        //console.log("bgColorForIndex = '" + s + "'")
        return s
    },

    setupColumnGroupColors: function () {
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
                cg.column().setSelectionColor(this.bgColorForIndex(i + 1))
            }
            i ++
        })

        return this
    },

    activeColumnGroups: function () {
        return this.columnGroups().select(cg => cg.node() !== null)
    },

    setColumnGroupCount: function (count) {
        //this.log("setColumnGroupCount " + count)
        if (count === 0) {
            StackTrace.shared().showCurrentStack()
        }

        if (this.columnGroups().length === count) { // redundant?
            return this
        }

        /*
		// collapse excess columns
        for (let i = count; i < this.columnGroups().length - 1; i ++) {
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
            const newCg = BrowserColumnGroup.clone()
            this.addColumnGroup(newCg)
            newCg.setMinAndMaxWidth(0)
            newCg.setFlexGrow(0)
        }

        //this.updateColumnPositions()
        this.setupColumnGroupColors()
        //this.log("this.columnGroups().length = " + this.columnGroups().length)
        //assert(this.columnGroups().length  === count)
        return this
    },

    clearColumnsGroupsAfterIndex: function (index) {
        const cgs = this.columnGroups()
        for (let i = index + 1; i < cgs.length; i++) {
            let cg = cgs[i]
            //console.log("clearing column group ", i)
            cg.setNode(null).syncFromNode()
        }
        return this
    },

    clearColumnsGroupsAfter: function (selectedCg) {
        const cgs = this.columnGroups()
        const index = cgs.indexOf(selectedCg)
        this.clearColumnsGroupsAfterIndex(index)
    },

    // --- get selected column ---------------------------------------

    selectedColumnGroup: function() {
        return this.columnGroups().detect( (cg) => { return cg.isSelected() })
    },

    selectedColumn: function() {
        const cg = this.selectedColumnGroup()
        if (cg) {
            return cg.column()
        }
        return null
    },

    // --- select column ---------------------------------------

    selectFirstColumn: function () {
        this.selectColumn(this.columns().first())
        return this
    },


    updateSelectedColumnTo: function (selectedColumn) {
        const selectedColumnGroup = selectedColumn.columnGroup()
        this.columnGroups().forEach(cg => cg.setIsSelected(cg === selectedColumnGroup))
        this.syncToHashPath()
        return this
    },

    popLastActiveColumn: function () {
        //console.log("popLastActiveColumn this.activeColumnGroups().length = ", this.activeColumnGroups().length)
        let n = this.activeColumnGroups().length - 1
        if (n < 0) { n = 0; }
        this.setColumnGroupCount(n) // TODO: collapse cg instead?
        this.fitColumns()
        this.syncToHashPath()
        return this
    },

    selectColumn: function (selectedColumn) {

        /*
        if (this.selectedColumn() == selectedColumn) {
            return this
        }
        */

        const selectedColumnGroup = selectedColumn.columnGroup()
        this._selectedColumnGroup = selectedColumnGroup

        const index = this.columnGroups().indexOf(selectedColumn.columnGroup())

        //console.log(this.typeId() + " selectColumn " + selectedColumn.node().type() + " index " + index)

        if (this.isSingleColumn()) {
            this.setColumnGroupCount(index + 2)
        } else {
            this.setColumnGroupCount(index + 3)
        }

        //console.log("selectColumn index: " + index + " cg " + this.columnGroups().length)

        const nextCg = this.columnGroups().itemAfter(selectedColumnGroup)

        if (nextCg) {
            const selectedRow = selectedColumnGroup.column().selectedRow()

            selectedColumnGroup.matchNodeMinWidth() // testing

            if (selectedRow) {
                const nextNode = selectedRow.nodeRowLink() // returns receiver by default
                //console.log("selectedRow title:  ", selectedRow.node().title())

                if (nextNode) {
                    //console.log("nextNode:  ", nextNode.title())
                    nextCg.setNode(nextNode)
                    this.clearColumnsGroupsAfter(nextCg)
                    //nextCg.column().setTitle(selectedColumn.selectedRowTitle())            
                    nextCg.syncFromNode()

                    //if ((nextNode.view().type() !== "BrowserColumnGroup") || nextNode.isKindOf(BMFieldSetNode)) { // TODO: use a better rule here
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
    },

    didClickRow: function (row) {
        console.log("Browser didClickRow ", row)
        // columns intercept this, so we don't get this message anymore
        return true
    },

    syncFromNode: function () {
        //this.log("syncFromNode")
        const columnGroups = this.columnGroups()
        columnGroups.first().setNode(this.node())

        columnGroups.forEach((cg) => {
            cg.syncFromNode()
        })

        this.setupColumnGroupColors()
        this.fitColumns()
        return this
    },

    clipToColumnGroup: function (cg) {
        const index = this.columnGroups().indexOf(cg)
        this.setColumnGroupCount(index + 1)
        return this
    },

    // --- width --------------------------

    widthOfColumnGroups: function () {
        return this.columnGroups().sum(cg => cg.minWidth())
    },

    // --- collapsing column groups -----

    lastActiveColumnGroup: function () {
        return this.columnGroups().reversed().detect(cg => cg.column().node() != null)
    },

    // --- fitting columns in browser ---------------------------------------------

    fitColumns: function () {
        //console.log(this.typeId() + " fitColumns")
        this.updateSingleColumnMode()

        const lastActiveCg = this.lastActiveColumnGroup()

        //console.log("this.isSingleColumn(): ", this.isSingleColumn())

        if (lastActiveCg && this.isSingleColumn()) {
            this.fitForSingleColumn()
        } else {
            this.fitForMultiColumn()
        }

        return this
    },

    updateBackArrow: function () {
        this.columnGroups().forEach(cg => cg.updateBackArrow())
        return this
    },

    makeLastActiveColumnFillRemainingSpace: function () {
        // TODO: merge with this code in multi column fit
        const lastActiveCg = this.lastActiveColumnGroup()
        const fillWidth = (this.browserWidth() - this.left()) - this.widthOfUncollapsedColumnsSansLastActive()
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

    fitForSingleColumn: function () {
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
    },

    uncollapsedColumns: function () {
        return this.activeColumnGroups().select(cg => !cg.isCollapsed())
    },

    widthOfUncollapsedColumns: function () {
        return this.uncollapsedColumns().sum(cg => cg.targetWidth())
    },

    widthOfUncollapsedColumnsSansLastActive: function () {
        const lastActiveCg = this.lastActiveColumnGroup()
        const cgs = this.uncollapsedColumns()
        cgs.remove(lastActiveCg)
        return cgs.sum(cg => cg.targetWidth())
    },

    setShouldShowTitles: function (aBool) {
        this.columnGroups().forEach(cg => cg.header().setShouldShowTitle(aBool) )
        return this
    },

    columnDescription: function () {
        let d = this.columnGroups().map((cg) => {
            if (cg.isCollapsed()) { return "" }
            let s = cg.name()
            if (cg.node() == null) { s += " [null node] " }
            //s += " " + (cg.isCollapsed() ? "collapsed" : "uncollapsed")
            s += " " + this.pxNumberToString(cg.targetWidth())
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

    fitForMultiColumn: function () {
        this.updateBackground()
        this.uncollapseAllColumns()
        this.collapseLeftColumnsUntilRightColumnsFit()
        this.expandLastColumnIfNeeded()
        this.updateBackArrow()
        this.setShouldShowTitles(false) // only show titles in single column mode
        //console.log(this.columnDescription())
        return this
    },

    uncollapseAllColumns: function () {
        this.columnGroups().forEach((cg) => {
            cg.setIsCollapsed(false)
            //console.log(cg.name() + " targetWidth: " + cg.targetWidth())
        })
        return this
    },

    collapseLeftColumnsUntilRightColumnsFit: function () {
        const lastActiveCg = this.lastActiveColumnGroup()
        const browserWidth = this.browserWidth()
        // collapse columns from left to right until they all fit
        this.columnGroups().forEach((cg) => {
            const usedWidth = this.widthOfUncollapsedColumns()
            let shouldCollapse = (usedWidth > this.browserWidth()) && (cg !== lastActiveCg)
            shouldCollapse = shouldCollapse || (cg.node() == null)
            //console.log(cg.name() + " shouldCollapse:" + shouldCollapse + " usedWidth: " + usedWidth + " browserWidth:" + this.browserWidth())
            cg.setIsCollapsed(shouldCollapse)
        })
        return this
    },

    expandLastColumnIfNeeded: function () {
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
    },

    // -----------------------------------------------

    browserWidth: function () {
        return this.clientWidth()
    },

    windowWidth: function () {
        return App.shared().mainWindow().width()
    },

    // --- node paths -----------------------------

    selectNode: function (aNode) {
        //console.log("selectNode " + aNode.nodePath())
        if (!aNode) {
            console.warn(this.type() + " selectNode called with null argument")
            StackTrace.shared().showCurrentStack()
            return this
        }
        this.selectNodePath(aNode.nodePath())
        return this
    },

    selectNodePath: function (nodePathArray) {
        //console.log(this.typeId() + ".selectNodePath(" + nodePathArray.map((node) => { return node.title() }).join("/")  + ")")
        //console.log(this.typeId() + ".selectNodePath() current path: " + this.nodePathString())
        this.setColumnGroupCount(1)

        let column = this.columns().first()

        if (nodePathArray.first() === column.node()) {
            //console.log("selectNodePath removeFirst column " + column.node().title())
            nodePathArray.removeFirst()
        }

        //console.log(this.typeId() + ".selectNodePath() selecting path " + nodePathArray.map((node) => { return node.title() }).join("/") )

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
    },

    nodeStringPath: function () {
    },

    nodePathArray: function () {
        return this.activeColumnGroups().map((cg) => { return cg.node() })
    },

    lastNode: function() {
        const cg = this.lastActiveColumnGroup()
        if (cg) {
            return cg.node()
        }
        return null
    },

    nodePath: function() {
        const lastNode = this.lastNode();
        if (lastNode) {
            return lastNode.nodePath();
        }
        return [];
    },

    nodePathString: function () {
        const lastNode = this.lastNode();
        if (lastNode) {
            return lastNode.nodePathString(); //.map((node) => { return node.title() }).join("/")
        }
        return ""
    },

    setNodePathComponents: function(nodePath) {
        this.setWatchForNodeUpdates(true);
        const lastNode = this.node().nodeAtSubpath(nodePath.slice(1));
        if (lastNode) {
            this.selectNode(lastNode);
        }
        return this;
    },

    setNodePathString: function (pathString) {
        return this.setNodePathComponents(pathString.split("/"));
    },

    // --- hash paths ------------------------------------- 

    performHashCommandIfPresent: function() {
        const hash = WebBrowserWindow.shared().urlHash()
        const commandString = hash.after(";")
        const command = HashCommand.clone().parseCommandString(commandString)
        const node = this.lastNode()
        command.setTarget(node).send()
        return this
    },

    syncFromHashPath: function () {
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
    },

    syncToHashPath: function () {
        const hash = JSON.stringify({ path: this.nodePath().map(n => n.title()) });
        WebBrowserWindow.shared().setUrlHash(hash)
        return this
    },

    didUpdateNode: function() {
        if (this.watchForNodeUpdates()) {
            this.syncToHashPath();
        }
    }
})
