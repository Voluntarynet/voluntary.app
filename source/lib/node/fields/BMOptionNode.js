"use strict"

/*

    BMOptionNode
    
    A single option from a set of options choices.

*/
        
BMStorableNode.newSubclassNamed("BMOptionNode").newSlots({
    label: null,
    value:  null,
}).setSlots({

}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setNodeCanReorderSubnodes(false)
        this.setupSubnodes()
        //this.setCanDelete(true)
        this.addStoredSlot("label")
        this.addStoredSlot("value")
    },

    title: function() {
        return this.label()
    },

})
