"use strict"

/*

    BMClassBrowser
    
*/

window.BMClassBrowser = BMNode.extend().newSlots({
    type: "BMClassBrowser",
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setNodeMinWidth(300)

        this.setTitle("Classes")

        // protos inspector
        const protoNode = BMProtoNode.clone()
        this.addSubnode(protoNode)
    },

})

