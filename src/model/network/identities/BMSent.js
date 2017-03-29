BMSent = BMListNode.extend().newSlots({
    type: "BMSent",
}).setSlots({
    init: function () {
        BMListNode.init.apply(this)
        this.setNoteIsItemCount(true)
        this.setTitle("Sent")
    },
})