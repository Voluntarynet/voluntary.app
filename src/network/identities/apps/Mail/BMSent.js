BMSent = BMListNode.extend().newSlots({
    type: "BMSent",
}).setSlots({
    init: function () {
        BMListNode.init.apply(this)
 		this.setShouldStore(true)
 		this.setShouldStoreSubnodes(false)
        this.setNnoteIsSubnodeCount(true)
        this.setTitle("sent")
    },
})