

BMDataStoreRecordView = NodeView.extend().newSlots({
    type: "BMDataStoreRecordView",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)        
        //this.setDivClassName("BMMessageView") // BMDataStoreRecordView
        //this.setEditable(false)
        return this
    },

    syncFromNode: function () {
        var node = this.node()
        this.setInnerHTML(JSON.stringify(JSON.parse(node.value()), null, 2))
        return this
    },
    
    onDidEdit: function (changedView) {        
        //this.syncToNode()
    },
})
