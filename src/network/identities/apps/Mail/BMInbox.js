BMInbox = BMStorableNode.extend().newSlots({
    type: "BMInbox",
}).setSlots({
    init: function () {
        BMListNode.init.apply(this)
 		this.setShouldStore(true)
 		this.setShouldStoreItems(false)
        this.setNoteIsItemCount(true)
        this.setTitle("inbox")
    },
})