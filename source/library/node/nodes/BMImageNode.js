"use strict"

/*

    BMImageNode
    
*/

BMStorableNode.newSubclassNamed("BMImageNode").newSlots({
    dataURL: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        
        this.setNodeCanEditTitle(true)
        this.setNodeCanEditSubtitle(false)
        this.setNodeMinWidth(200)
        this.setTitle("Untitled")
        this.setSubtitle(null)
        
        this.addActions(["add"])
        this.setCanDelete(true)
        this.addStoredSlots(["title", "dataURL"])
    },        
    
    onDidEditNode: function() {
        console.log(this.typeId() + " onDidEditNode")
        this.scheduleSyncToStore()
    },
})
