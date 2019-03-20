"use strict"

/* 

    AtomNodeView

*/


window.AtomNodeView = NodeView.extend().newSlots({
    type: "AtomNodeView",

    // subviews
    // where do preview items fit into this?
    
    headView: null,
    dividerView: null,
    tailView: null,

    // orientation
    isVertical: true,

    // header size
    headWidth: 100,
    headHeight: 100,

    gridSize: 50,
    // peristent attributes
    viewDictSlots: ["isVertical", "headWidth", "headHeight"], // move to view?

    // control buttons
    //
    // how do we avoid overlaping close and orient buttons?
    // - only show close button for innermost atoms?
    // - place buttons on divides as they never overlap and it's always clear which view they control?
    //
    // what about touch UI?
    // - tap divider to put it into edit mode, tap outside it to end edit mode
    // - in edit mode, highlight it, show close and orient controls

    closeButton: null, 
    orientButton: null,
    addAtomButton: null,

}).setSlots({
    init: function () {
        NodeView.init.apply(this)

        this.setupHeadView()
        this.setupDividerView()
        this.setupTailView()

        this.setCloseButton(CloseButton.clone().setTarget(this))
        this.addSubview(this.closeButton())

        this.setOrientButton(CloseButton.clone().setTarget(this))
        this.addSubview(this.orientButton())

        this.setContentEditable(false)
        this.turnOffUserSelect()
        this.setTransition("all 0.3s")
        this.setOverflow("hidden")
        this.syncLayout()
        return this
    },

    setIsVertical: function(aBool) {
        this._isVertical = aBool
        return this
    },

    setupHeadView: function() {
        let v = AtomPaneView.clone()
        this.setHeadView(v)
        v.setDivClassName("AtomHeadView")
        v.setPosition("relative")
        v.setBackgroundColor("black")
        this.addSubview(v)
    },

    setupDividerView: function() {
        let v = DragBarView.clone()
        this.setDividerView(v)
        //v.setDivClassName("AtomDividerView")
        v.setPosition("relative")
        //v.setBackgroundColor("white")
        v.setDelegate(this)
        this.addSubview(v)
    },

    setupTailView: function() {
        let v = AtomPaneView.clone()
        this.setTailView(v)
        v.setDivClassName("AtomTailView")
        v.setPosition("relative")
        v.setBackgroundColor("black")
        this.addSubview(v)
    },

    syncLayout: function() {
        this.setWidthPercentage(100)
        this.setHeightPercentage(100)

        if (this.isVertical()) {
            this.layoutVertically()
        } else {
            this.layoutHorizontally()
        }
        return this
    },

    layoutVertically: function() {
        // vertical divider

        if (true) {
            let h = this.headView()
            h.setDisplay("block")
            h.setWidthPercentage(100)
            h.setHeightPxNumber(this.headHeight())
        }

        if (true) {
            let d = this.dividerView()
            d.setDisplay("block")
            d.setMinAndMaxHeight(d.thickness())
            d.setWidthPercentage(100)
            d.setIsVerticalDrag(true)
        }

        if (true) {
            let t = this.tailView()
            t.setDisplay("block")
            t.setWidthPercentage(100)
            t.setHeightPercentage(100)
            t.setBackgroundColor("black")
        }
    },

    layoutHorizontally: function() {
        // horizontal divider

        this.setDisplay("table")

        if (true) {
            let h = this.headView()
            h.setDisplay("table-cell")
            h.setMinAndMaxWidth(this.headWidth())
            h.setWidth(null)
            h.setMinHeight("100%")
            h.setOverflow("auto")
        }

        if (true) {
            let d = this.dividerView()
            d.setDisplay("table-cell")
            d.setWidth(null)
            d.setMinAndMaxWidth(d.thickness())
            d.setOverflow("auto")
            d.setVerticalAlign("top")
            d.setIsVerticalDrag(false)
        }

        if (true) {
            let t = this.tailView()
            t.setDisplay("table-cell")
            t.setWidthPercentage(100)
            t.setMinHeight("100%")
            t.setOverflow("auto")
            t.setVerticalAlign("top")
        }
    },

    didDragDivider: function(x, y) {
        let bounds = this.boundingClientRect()

        let g = this.gridSize()

        x = Math.floor(Math.floor(x/g)*g)
        y = Math.floor(Math.floor(y/g)*g)

        y = y - bounds.top
        x = x - bounds.left
        x = Math.min(x, bounds.right  - bounds.left)
        y = Math.min(y, bounds.bottom - bounds.top)

        if (this.isVertical()) {
            this.setHeadHeight(y)
        } else {
            this.setHeadWidth(x)
        }

        this.syncLayout()
    },

    viewDict: function() { // move to view?
        let dict = {}
        this.viewDictSlots().forEach((slotName) => {
            let value = this[slotName].apply(this)
            dict[slotName] = value
        })
        return dict
    },

    setViewDict: function(dict) { // move to view?
        this.viewDictSlots().forEach((slotName) => {
            let value = dict[slotName]
            if (typeof(value) != "undefined") {
                this[slotName.asSetter()].apply(this, [value])
            }
        })
    },

    syncToNode: function() {
        CloseableNodeView.syncToNode.apply(this)
        this.node().setNodeViewDict(this.viewDict()) // move to view?
    },

    syncFromNode: function() {
        this.setViewDict(this.node().nodeViewDict()) // move to view?
    },

    // --- closable set/get ---
    
    setIsCloseable: function(aBool) {
        this.closeButton().setIsEnabled(aBool)
        return this
    },

    
    isCloseable: function (aBool) {
        return this.closeButton().isEnabled()
    },
    
    // --- close with collapse animation ---

    collapse: function() {
        this.closeButton().setOpacity(0).setTarget(null)
        this.setOpacity(0)
		
        this.setWidth("0px")
		
        this.setPaddingLeft(0)
        this.setPaddingRight(0)
		
        this.setMarginLeft(0)
        this.setMarginRight(0)
    },
    
    close: function() {
        let seconds = 0.3
		
        this.collapse()
        
        setTimeout( () => { 
            //this.removeCloseButton()
            let parentView = this.parentView()
            //this.removeFromParentView()
            
            this.node().removeFromParentNode()
            this.removeFromParentView()
            //parentView.scheduleSyncToNode() 
            // TODO: protocol to tell parent to remove subnode

        }, seconds * 1000)
    },

    /*
    // mouse

    onDoubleClick: function(event) {
        console.log("onDoubleClick")
        let v = AtomNodeView.clone().setNode(AtomNode.clone())
        this.addSubview(v)
    },
    */
})
