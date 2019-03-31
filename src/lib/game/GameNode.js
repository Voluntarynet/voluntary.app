"use strict"

/*

    GameNode
    
    
*/  
        
window.GameNode = BMStorableNode.extend().newSlots({
    type: "GameNode",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setNodeTitleIsEditable(true)
        this.setNodeSubtitleIsEditable(true)
        this.setTitle("Game")
        this.setSubtitle("test")
        this.setNodeMinWidth(2000)
        
        //this.setSubnodeProto(BMInfoNode)
        //this.addActions(["add", "delete"])
        //this.addStoredSlots(["title", "subtitle"])
    },        
    
    /*
    onDidEditNode: function() {
        console.log(this.typeId() + " onDidEditNode")
        this.scheduleSyncToStore()
    },
    */
})
