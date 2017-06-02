BMDrafts = BMListNode.extend().newSlots({
    type: "BMDrafts",
}).setSlots({
    init: function () {
        BMListNode.init.apply(this)
 		this.setShouldStore(true)
        this.setNoteIsItemCount(true)
        this.setSubnodeProto(BMPrivateMessage).addAction("add")
        this.setTitle("drafts")
    },
    
    localIdentity: function() {
        return this.parentNode()
    },
    
    add: function() {
        var newPrivateMsg = BMListNode.add.apply(this)
        //var toKey = this.localIdentity().publicKey().toString()
        //var name = this.localIdentity().name()
        //newItem.fieldNamed("from").setFromContactName(name)
		//newItem.useDefaultFromAddress()
		newPrivateMsg.setFromContact(this.localIdentity().name())
        this.didUpdate()
        return newItem
    },
    
    localIdentity: function() {
        return this.parentNode()
    },
    
})