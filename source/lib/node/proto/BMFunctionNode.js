"use strict"

/*

    BMFunctionNode
    
*/

window.BMFunctionNode = BMFieldSetNode.extend().newSlots({
    type: "BMFunctionNode",
    functionValue: null,
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
 		this.setShouldStore(false)
        this.setNodeMinWidth(600)
        this.setTitle("function")
    },

    setupSubnodes: function() {
     
        return this
    },

    prepareForFirstAccess: function () {
        if (this._subnodes.length === 0) {
            this.setupSubnodes()
        }
    },
})