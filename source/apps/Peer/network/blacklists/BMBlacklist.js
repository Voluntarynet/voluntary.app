"use strict"

/*

    BMBlacklist
    
*/

BMStorableNode.newSubclassNamed("BMBlacklist").newSlots({
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)	
        this.setShouldStore(true)	
 		this.setShouldStoreSubnodes(true)
        this.setTitle("Blacklist")
	    this.addAction("add")
        this.setSubnodeProto(BMBlacklistEntry)
        this.setNoteIsSubnodeCount(true)
    },
	
})
