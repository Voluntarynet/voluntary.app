
"use strict"

window.BMDrafts = BMStorableNode.extend().newSlots({
    type: "BMDrafts",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
 		this.setShouldStore(true)
        this.setNoteIsSubnodeCount(true)
        this.setSubnodeProto(BMMailMessage).addAction("add")
        this.setTitle("drafts")
    },
    
    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },
    
    add: function() {
        var newPrivateMsg = BMStorableNode.add.apply(this)
		newPrivateMsg.setSenderPublicKeyString(this.localIdentity().publicKeyString()).setupInputsFromPubkeys()
        this.didUpdateNode()
        return newPrivateMsg
    },
    
})