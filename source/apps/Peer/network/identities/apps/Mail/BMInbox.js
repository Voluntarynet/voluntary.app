
"use strict"

/*

    BMInbox

*/

BMStorableNode.newSubclassNamed("BMInbox").newSlots({
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
 		this.setShouldStore(true)
 		this.setShouldStoreSubnodes(false)
        this.setNoteIsSubnodeCount(true)
        this.setTitle("inbox")
    },
})