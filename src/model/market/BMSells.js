
BMSells = BMStorableNode.extend().newSlots({
    type: "BMSells",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        //this.setTitle("Sells")
        this.setTitle("My Sales")
        //this.setPid("_sells")
        this.setActions(["add"])
        this.setSubnodeProto(BMSell)
        this.setNoteIsItemCount(true)
    },
    
    addItem: function(anItem) {
        BMStorableNode.addItem.apply(this, [anItem])
        anItem.asyncStoreInSoup()
        return this
    },
    

})
