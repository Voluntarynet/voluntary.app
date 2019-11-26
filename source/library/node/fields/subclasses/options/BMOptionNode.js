"use strict"

/*

    BMOptionNode
    
    A single option from a set of options choices.

*/
        
BMStorableNode.newSubclassNamed("BMOptionNode").newSlots({
    label: "Option Title",
    value:  null,
    isPicked: false,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setNodeCanReorderSubnodes(false)
        this.setCanDelete(true)
        this.addStoredSlot("label")
        this.addStoredSlot("value")
        this.addStoredSlot("isPicked")
        this.setNodeCanEditTitle(true)
    },

    shallowCopySlotnames: function() {
        const names = BMStorableNode.shallowCopySlotnames.apply(this)
        return names.appendItems([
            "label", "value", "isPicked", 
        ])
    },

    setIsPicked: function(aBool) {
        if (this.isPicked() !== aBool) {
            this._isPicked = aBool
            if (this.parentNode()) {
                this.parentNode().didToggleOption(this)
                this.didUpdateNode()
                this.scheduleSyncToStore()
            }
        }
        return this
    },

    toggle: function() {
        this.setIsPicked(!this.isPicked())
        return this
    },

    title: function() {
        return this.label()
    },

    value: function() {
        return this.title()
    },

    setTitle: function(aString) {
        this.setLabel(aString)
        return this
    },

    subtitle: function() {
        return null
    },

    summary: function() {
        return this.title()
    },

    note: function() {
        return this.isPicked() ? "✓" : ""
    },

}).initThisProto()
