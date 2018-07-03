"use strict"

window.AtomNodeView = CloseableNodeView.extend().newSlots({
    type: "AtomNodeView",
    headView: null,
    tailView: null,
    isVertical: true,
    headWidth: 100,
    headHeight: 100,
    viewDictSlots: ["isVertical", "headWidth", "headHeight"], // move to view?
}).setSlots({
    init: function () {
        CloseableNodeView.init.apply(this)

        this.setupHeadView()
        this.setupTailView()

        this.setContentEditable(false)
        this.turnOffUserSelect()
        this.setTransition("all 0.3s")
        return this
    },

    setupHeadView: function() {
        this.setHeadView(DivView.clone())
        this.addSubview(this.headView())

        this.headView().setPosition("relative")
        this.tailView().setPosition("relative")
    },

    setupTailview: function() {
        this.setTailView(DivView.clone())
        this.addSubview(this.tailView())
    },

    syncLayout: function() {
        if (this.isVertical()) {
            this.layoutVertically()
        } else {
            this.layoutHorizontally()
        }
    },

    layoutVertically: function() {
        this.headView().setDisplay("block")
        this.headView().setWidth("100%").setHeight(this.headHeight())

        this.tailView().setDisplay("block")
        this.tailView().setWidth("100%").setHeight("auto")
    },

    layoutHorizontally: function() {
        this.headView().setDisplay("inline-block")
        this.headView().setWidth(this.headWidth()).setHeight("100%")

        this.tailView().setDisplay("inline-block")
        this.headView().setWidth("auto").setHeight("100%")
    },

    viewDict: function() { // move to view?
        var dict = {}
        this.viewDictSlots().forEach((slotName) => {
            let value = this[slotName].apply(this)
            dict[slotName] = value
        })
        return dict
    },

    setViewDict: function() { // move to view?
        this.viewDictSlots().forEach((slotName) => {
            let value = dict[slotName]
            this[slotName.asSetter()].apply(this, [value])
        })
    },

    syncToNode: function() {
        CloseableNodeView.syncToNode.apply(this)
        this.node().setNodeViewDict(this.viewDict()) // move to view?
    },

    syncFromNode: function() {
        this.setViewDict(this.node().nodeViewDict()) // move to view?
    },

})
