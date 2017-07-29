/*
    BMImagesNode 
*/  

BMImagesNode = BMStorableNode.extend().newSlots({
    type: "BMImagesNode",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)

        this.setViewClassName("ImageView")
        this.setSubnodeProto("ImageNode"))
        
        this.setNodeTitleIsEditable(true)
        this.setNodeSubtitleIsEditable(false)
        this.setNodeMinWidth(200)
        this.setTitle(null)
        this.setSubtitle(null)
        
        //this.addActions(["add", "delete"])
        //this.addStoredSlots(["title", "dataURL"])
    },        
    
    /*
    onDidEditNode: function() {
        console.log(this.type() + " onDidEditNode")
        this.markDirty()
    },
    */
})
