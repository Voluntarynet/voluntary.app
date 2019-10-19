"use strict"

/*

    BMDateNode
    
    

*/
        
BMStorableNode.newSubclassNamed("BMDateNode").newSlots({
    value: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setNodeCanReorderSubnodes(false)
        this.setCanDelete(true)

        this.setTitle("Date")
        this.addStoredSlot("title")
        this.addStoredSlot("value")
        this.setNodeCanEditTitle(true)
        this.setNodeCanEditSubtitle(false)

        return this
    },

    subtitle: function() {
        return "full date"
    },

    note: function() {
        return "&gt;"
    },

    prepareToSyncToView: function() {
        // called after DateNode is selected
        if (!this.hasSubnodes()) {
            const startYear = 2019
            const yearRange = 3
            for (let i = startYear; i < startYear + yearRange; i++) {
                const year = BMYearNode.clone().setValue(i)
                this.addSubnode(year)
            }
        }
    },

})
