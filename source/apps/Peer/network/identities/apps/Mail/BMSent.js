
"use strict"

/*

    BMSent

*/

BMStorableNode.newSubclassNamed("BMSent").newSlots({
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
 		this.setShouldStore(true)
 		this.setShouldStoreSubnodes(false)
        this.setNoteIsSubnodeCount(true)
        this.setTitle("sent")
    },
    
}).initThisProto()