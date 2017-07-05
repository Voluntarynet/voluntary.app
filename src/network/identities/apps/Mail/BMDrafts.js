


BMDrafts = BMListNode.extend().newSlots({
    type: "BMDrafts",
}).setSlots({
    init: function () {
        BMListNode.init.apply(this)
 		this.setShouldStore(true)
        this.setNoteIsSubnodeCount(true)
        this.setSubnodeProto(BMMailMessage).addAction("add")
        this.setTitle("drafts")
    },
    
    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },
    
    add: function() {
        var newPrivateMsg = BMListNode.add.apply(this)
		newPrivateMsg.setSenderPublicKeyString(this.localIdentity().publicKeyString()).setupInputsFromPubkeys()
        this.didUpdate()
        return newPrivateMsg
    },
    
})