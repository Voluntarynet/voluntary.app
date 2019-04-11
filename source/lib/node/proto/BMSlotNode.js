"use strict"

/*

    BMSlotNode
    
*/

window.BMSlotNode = BMFieldSetNode.extend().newSlots({
    type: "BMSlotNode",
    protoValue: null,
    slotName: null,
    slotValue: null,
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
 		this.setShouldStore(false)
        this.setNodeMinWidth(600)
    },

    title: function() {
        return this.slotName()
    },


})