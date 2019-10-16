"use strict"

/*

    BMOptionNode
    
    A single option from a set of options choices.

*/
        
BMStorableNode.newSubclassNamed("BMOptionNode").newSlots({
    label: "Option Title",
    value:  null,
    isSelected: false,
}).setSlots({

}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setNodeCanReorderSubnodes(false)
        this.setCanDelete(true)
        this.addStoredSlot("label")
        this.addStoredSlot("value")
        this.addStoredSlot("isSelected")
        this.setNodeCanEditTitle(true)
    },

    title: function() {
        return this.label()
    },

    setTitle: function(aString) {
        this.setLabel(aString)
        return this
    },

    subtitle: function() {
        return null
        //return this.isSelected() ? "is selected" : "is not selected"
    },

    note: function() {
        return this.isSelected() ? "&#10003;" : ""
    },

})
