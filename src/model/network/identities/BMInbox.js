BMInbox = BMStorableNode.extend().newSlots({
    type: "BMInbox",
}).setSlots({
    init: function () {
        BMListNode.init.apply(this)
        this.setNoteIsItemCount(true)
        this.setTitle("Inbox")
    },
})