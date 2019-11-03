"use strict"

/*

    BMSells

*/

BMStorableNode.newSubclassNamed("BMSells").newSlots({
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
		
        //this.setTitle("Sells")
        this.setTitle("My Sales")
        //this.setActions(["add"])
        this.setSubnodeProto(BMSell)
        this.setNoteIsSubnodeCount(true)
    },
    

})
