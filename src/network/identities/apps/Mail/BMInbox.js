BMInbox = BMStorableNode.extend().newSlots({
    type: "BMInbox",
}).setSlots({
    init: function () {
        BMListNode.init.apply(this)
 		this.setShouldStore(true)
 		this.setShouldStoreSubnodes(false)
        this.setNoteIsSubnodeCount(true)
        this.setTitle("inbox")
    },
})