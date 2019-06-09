"use strict"

/*

    BMPostDrafts

*/

window.BMPostDrafts = BMStorableNode.extend().newSlots({
    type: "BMPostDrafts",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        //this.setLinkProto(BMChatThread)
        this.setShouldStore(true)	
        this.setShouldStoreSubnodes(true)	
        this.setNodeMinWidth(450)
        this.setSubnodeProto(BMPostDraft)
        this.addAction("add")

        this.setNodeColumnBackgroundColor("white")
        this.setNoteIsSubnodeCount(true)
        this.setTitle("my drafts")
    },

    finalize: function() {
        BMStorableNode.finalize.apply(this)
        this.setTitle("my drafts")
    },
	

    add: function() {
        const result = BMStorableNode.add.apply(this)
        this.scheduleSyncToStore()
        this.didUpdateNode()
        return result
    },

    /*
	scheduleSyncToStore: function() {
		BMStorableNode.scheduleSyncToStore.apply(this)
        console.log(this.typeId() + " scheduleSyncToStore")
		return this
	},
	*/
	
    shelfIconName: function() {
	    return "chat/drafts"
	    //return "write-white"
    },
	
    // badge - a badge without a title becomes a marker
	
    nodeViewShouldBadge: function() {
        return this.subnodesCount() > 0
    },
})