"use strict"

window.AtomNodeView = CloseableNodeView.extend().newSlots({
    type: "AtomNodeView",
    headView: null,
    tailView: null,
    isVertical: true,
    viewDictSlots: ["isVertical"], // move to view?
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
    },

    setupTailview: function() {
        this.setTailView(DivView.clone())
        this.addSubview(this.tailView())
    },

    syncLayout: function() {
        if (this.isVertical()) {
            /*
            this.headView().setPosition()

            */
        }
    },

    layoutVertically: function() {

    },

    layoutHorizontally: function() {

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
