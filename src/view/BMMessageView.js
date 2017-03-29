
BMMessageView = NodeView.extend().newSlots({
    type: "BMMessageView",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)        
        this.setDivClassName("BMMessageView")
        //this.setEditable(false)
        return this
    },

    syncFromNode: function () {
        var node = this.node()
        this.setInnerHTML("" + JSON.stringify(node.msgDict(), null, 2))
        return this
    },
    
    /*
    syncToNode: function () {
        //this.log("=== syncToNode " + this.node().type())
        var node = this.node()
        
        NodeView.syncToNode.apply(this)
        
        return this
    },
    */
    
    onDidEdit: function (changedView) {        
        //this.syncToNode()
    },
})
