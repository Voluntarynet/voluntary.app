"use strict"

/*

    BMOptionNodeRowView 


*/


BrowserTitledRow.newSubclassNamed("BMOptionNodeRowView").newSlots({
}).setSlots({
    
    init: function () {
        BrowserTitledRow.init.apply(this)
        this.setHasSubtitle(true)
        return this
    },
                                
    select: function() {
        BrowserTitledRow.select.apply(this)
        console.log(this.typeId() + " selected ")
        this.node().setIsSelected(!this.node().isSelected()) // will tell parent node which will ensure only one selected if needed
        //this.browser().previous()
        // unselect parentNode's view in previous column?
        //this.didEdit()
        this.node().scheduleSyncToView()
        this.node().parentNode().scheduleSyncToView()
        return this
    },

    syncToNode: function() {
        BrowserTitledRow.syncToNode.apply(this)
        return this
    },
	
})
