"use strict"

/*
	BMItemNode
*/

window.BMItemNode = BMNode.extend().newSlots({
    type: "BMItemNode",
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        //this.setViewClassName("GenericView")
        this.setNodeMinWidth(300)

        this.setShouldStore(true)
        this.setShouldSubnodes(true)

        this.setNoteIsSubnodeCount(false)
        
        this.addStoredSlot("title")
        this.setNodeTitleIsEditable(true)

        this.addStoredSlot("subtitle")
        this.setNodeSubtitleIsEditable(true)

        this.addStoredSlot("nodeNote")
    },
})

