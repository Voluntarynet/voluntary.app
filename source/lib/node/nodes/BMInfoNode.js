"use strict"

/*

    BMInfoNode
    
    Used for editable tree of title/subtitle info
    
*/  
        
window.BMInfoNode = BMStorableNode.extend().newSlots({
    type: "BMInfoNode",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setNodeTitleIsEditable(true)
        this.setNodeSubtitleIsEditable(true)
        this.setTitle("Untitled")
        this.setSubtitle("...")
        
        this.setSubnodeProto(BMInfoNode)
        this.addActions(["add", "delete"])
        this.addStoredSlots(["title", "subtitle"])
    },        
    
    onDidEditNode: function() {
        console.log(this.typeId() + " onDidEditNode")
        this.scheduleSyncToStore()
    },
})
