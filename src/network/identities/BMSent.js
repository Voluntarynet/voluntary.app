BMSent = BMListNode.extend().newSlots({
    type: "BMSent",
}).setSlots({
    init: function () {
        BMListNode.init.apply(this)
 		this.setShouldStore(true)
 		this.setShouldStoreItems(false)
        this.setNoteIsItemCount(true)
        this.setTitle("Sent")
    },
})