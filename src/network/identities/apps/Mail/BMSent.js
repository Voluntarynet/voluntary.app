
BMSent = BMStorableNode.extend().newSlots({
    type: "BMSent",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
 		this.setShouldStore(true)
 		this.setShouldStoreSubnodes(false)
        this.setNoteIsSubnodeCount(true)
        this.setTitle("sent")
    },
})