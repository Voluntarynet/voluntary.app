"use strict"

/*
	AtomNode
*/

window.AtomNode = BMStorableNode.extend().newSlots({
    type: "AtomNode",
    nodeViewDict: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)

        this.setNodeViewDict({})
        this.addStoredSlot("nodeViewDict")
       
        //this.setViewClassName("GenericView")
        this.setNodeMinWidth(300)

        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)

        this.setNoteIsSubnodeCount(false)
        
        this.addStoredSlot("title")
        this.setNodeTitleIsEditable(true)

        this.addStoredSlot("subtitle")
        this.setNodeSubtitleIsEditable(true)

        this.addStoredSlot("nodeNote")

    },
})

