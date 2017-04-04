
BMSells = BMStorableNode.extend().newSlots({
    type: "BMSells",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setShouldStore(true)
		this.setShouldStoreItems(true)
		
        //this.setTitle("Sells")
        this.setTitle("My Sales")
        //this.setPid("_sells")
        //this.setActions(["add"])
        this.setSubnodeProto(BMSell)
        this.setNoteIsItemCount(true)
    },
    

})
