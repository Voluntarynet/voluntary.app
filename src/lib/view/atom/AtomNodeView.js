"use strict"

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

        this.syncLayout()
        return this
    },

    setIsVertical: function(aBool) {
        this._isVertical = aBool
        return this
    },

    setupHeadView: function() {
        var v = DivView.clone()
        this.setHeadView(v)
        v.setDivClassName("AtomHeadView")
        v.setPosition("relative")
        v.setBackgroundColor("#000")
        this.addSubview(v)
    },

    setupDividerView: function() {
        var v = DragBarView.clone()
        this.setDividerView(v)
        //v.setDivClassName("AtomDividerView")
        v.setPosition("relative")
        //v.setBackgroundColor("white")
        v.setDelegate(this)
        this.addSubview(v)
    },

    setupTailView: function() {
        var v = DivView.clone()
        this.setTailView(v)

        v.setDivClassName("AtomTailView")
        v.setPosition("relative")
        v.setBackgroundColor("#000")

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

    },

    layoutVertically: function() {

        var h = this.headView()
        h.setDisplay("block")
        h.setWidthPercentage(100)
        h.setHeightPxNumber(this.headHeight())

        let d = this.dividerView()
        d.setDisplay("block")
        d.setMinAndMaxHeight(d.thickness())
        d.setWidthPercentage(100)
        d.setIsVerticalDrag(true)

        let t = this.tailView()
        t.setDisplay("block")
        t.setWidthPercentage(100)
        t.setHeightPercentage(100)
    },

    layoutHorizontally: function() {
        this.setDisplay("table")

        var h = this.headView()
        h.setDisplay("table-cell")
        h.setMinWidth(this.headWidth())
        h.setMinHeight("100%")
        h.setOverflow("auto")

        let d = this.dividerView()
        d.setDisplay("table-cell")
        d.setMinAndMaxWidth(d.thickness())
        d.setOverflow("auto")
        d.setVerticalAlign("top")
        d.setIsVerticalDrag(false)

        let t = this.tailView()
        t.setDisplay("table-cell")
        t.setWidthPercentage(100)
        t.setMinHeight("100%")
        t.setOverflow("auto")
        t.setVerticalAlign("top")
    },

    didDragDivider: function(x, y) {

        if (this.isVertical()) {
            this.setHeadHeight(y)
        } else {
            this.setHeadWidth(x)
        }

        this.syncLayout()
    },

    viewDict: function() { // move to view?
        var dict = {}
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
        var seconds = 0.3
		
        this.collapse()
        
        setTimeout( () => { 
            //this.removeCloseButton()
            var parentView = this.parentView()
            //this.removeFromParentView()
            
            this.node().removeFromParentNode()

            //parentView.scheduleSyncToNode() 
            // TODO: protocol to tell parent to remove subnode

        }, seconds * 1000)
    },


})
