
"use strict"

window.BMSells = BMStorableNode.extend().newSlots({
    type: "BMSells",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
		
        //this.setTitle("Sells")
        this.setTitle("My Sales")
        //this.setPid("_sells")
        //this.setActions(["add"])
        this.setSubnodeProto(BMSell)
        this.setNoteIsSubnodeCount(true)
    },
    

})
