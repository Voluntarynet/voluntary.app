
"use strict"

/*

    BMDrafts

*/

BMStorableNode.newSubclassNamed("BMDrafts").newSlots({
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
 		this.setShouldStore(true)
        this.setNoteIsSubnodeCount(true)
        this.setSubnodeProto(BMMailMessage)
        this.addAction("add")
        this.setTitle("drafts")
    },
    
    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },
    
    add: function() {
        const newPrivateMsg = BMStorableNode.add.apply(this)
        newPrivateMsg.setSenderPublicKeyString(this.localIdentity().publicKeyString()).setupInputsFromPubkeys()
        this.didUpdateNode()
        return newPrivateMsg
    },
    
}).initThisProto()