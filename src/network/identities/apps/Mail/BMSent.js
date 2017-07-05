BMSent = BMListNode.extend().newSlots({
    type: "BMSent",
}).setSlots({
    init: function () {
        BMListNode.init.apply(this)
 		this.setShouldStore(true)
 		this.setShouldStoreSubnodes(false)
        this.setNoteIsSubnodeCount(true)
        this.setTitle("sent")
    },
})