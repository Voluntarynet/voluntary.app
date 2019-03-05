"use strict"

/*

    BMImageNode
    
*/

window.BMImageNode = BMStorableNode.extend().newSlots({
    type: "BMImageNode",
    dataURL: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        
        this.setNodeTitleIsEditable(true)
        this.setNodeSubtitleIsEditable(false)
        this.setNodeMinWidth(200)
        this.setTitle("Untitled")
        this.setSubtitle(null)
        
        this.addActions(["add", "delete"])
        this.addStoredSlots(["title", "dataURL"])
    },        
    
    onDidEditNode: function() {
        console.log(this.type() + " onDidEditNode")
        this.scheduleSyncToStore()
    },
})
