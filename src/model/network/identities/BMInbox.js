BMInbox = BMStorableNode.extend().newSlots({
    type: "BMInbox",
}).setSlots({
    init: function () {
        BMListNode.init.apply(this)
 		this.setShouldStore(true)
        this.setNoteIsItemCount(true)
        this.setTitle("Inbox")
    },
})