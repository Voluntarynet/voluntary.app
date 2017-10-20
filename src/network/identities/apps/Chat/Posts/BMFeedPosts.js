
"use strict"

window.BMFeedPosts = BMStorableNode.extend().newSlots({
    type: "BMFeedPosts",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setTitle("feed")
        this.setShouldStore(true)	
		this.setNoteIsSubnodeCount(true)
		
        this.setActions(["deleteAll"])
        this.setShouldStore(true)
        this.setNodeMinWidth(450)
        this.setSubnodeProto(BMPostMessage)
		this.setNodeBackgroundColor("white")
		this.setNoteIsSubnodeCount(true)
    },

	finalize: function() {
		BMStorableNode.finalize.apply(this)
		this.setTitle("feed")
	},
	
	deleteAll: function() {
	    this.subnodes().forEach((post) => {
	        post.prepareToDelete()
	    })
	    this.removeAllSubnodes()
	    return this
	},
})