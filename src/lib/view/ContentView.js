"use strict"

/*

    ContentView

*/

window.ContentView = NodeView.extend().newSlots({
    type: "ContentView",
}).setSlots({
    /*
    init: function () {
        NodeView.init.apply(this)
        return this
    },
    */

    syncFromNode: function () {
        let node = this.node()
        if (node.nodeContent) {
            this.element().setInnerHTML(node.nodeContent())
        }
        return this
    },
    
    syncToNode: function () {
        let node = this.node()
        if (node.setNodeContent) {
            node.setNodeContent(this.element().innerHTML())
        }
        NodeView.syncToNode.apply(this)
        return this
    },
    
    setEditable: function (aBool) {
        this.titleView().setContentEditable(aBool)
        this.subtitleView().setContentEditable(aBool)
        return this
    },
    
    onDidEdit: function (changedView) {     
        //this.log("onDidEdit")   
        this.scheduleSyncToNode() //this.syncToNode()
    },
})
