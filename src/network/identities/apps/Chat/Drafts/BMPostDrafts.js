
"use strict"

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

		this.setNodeBackgroundColor("white")
		this.setNoteIsSubnodeCount(true)
		this.setTitle("my drafts")
    },

	finalize: function() {
		BMStorableNode.finalize.apply(this)
		this.setTitle("my drafts")
	},
	

	add: function() {
		var result = BMStorableNode.add.apply(this)
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
	    return "write-white"
	},
	
	nodeViewShouldBadge: function() {
		return this.subnodesLength() > 0
	},
	
	nodeViewBadgeTitle: function() {
		return null
	},
})