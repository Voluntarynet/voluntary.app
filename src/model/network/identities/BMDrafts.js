BMDrafts = BMListNode.extend().newSlots({
    type: "BMDrafts",
}).setSlots({
    init: function () {
        BMListNode.init.apply(this)
        this.setNoteIsItemCount(true)
        this.setSubnodeProto(BMDraft).addAction("add")
        this.setTitle("Drafts")
    },
    
    localIdentity: function() {
        return this.parentNode()
    },
    
    add: function() {
        var newItem = BMListNode.add.apply(this)
        var toKey = this.localIdentity().publicKey().toString()
        newItem.fieldNamed("from").setTitle(toKey)
        this.didUpdate()
        return newItem
    },
    
    localIdentity: function() {
        return this.parentNode()
    },
    
})