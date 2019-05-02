"use strict"

/*

    BMCreatorNode
    
    A stand-in node that let's the user select field to replace it with.

*/
        
window.BMCreatorNode = BMNode.extend().newSlots({
    type: "BMCreatorNode",
}).setSlots({

}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setupSubnodes()
    },

    title: function() {
        return "Choose field type"
    },
	
    setupSubnodes: function() {
        

        return this
    },

})
