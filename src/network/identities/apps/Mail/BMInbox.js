
"use strict"

window.BMInbox = BMStorableNode.extend().newSlots({
    type: "BMInbox",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
 		this.setShouldStore(true)
 		this.setShouldStoreSubnodes(false)
        this.setNoteIsSubnodeCount(true)
        this.setTitle("inbox")
    },
})