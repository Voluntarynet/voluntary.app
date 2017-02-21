
BMSells = BMStorableNode.extend().newSlots({
    type: "BMSells",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setTitle("Sells")
        this.setPid("_sells")
        this.setActions(["add"])
        this.setSubnodeProto(BMSell)
        this.setNoteIsItemCount(true)
    },
})
