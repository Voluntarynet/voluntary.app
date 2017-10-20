
"use strict"

window.BMMyPosts = BMStorableNode.extend().newSlots({
    type: "BMMyPosts",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        //this.setLinkProto(BMChatThread)
		this.setTitle("my posts")
        this.setActions(["deleteAll"])
        this.setShouldStore(true)	
        this.setNodeMinWidth(450)
        this.setSubnodeProto(BMPostMessage)
		this.setNodeBackgroundColor("white")
		this.setNoteIsSubnodeCount(true)
    },

	finalize: function() {
		BMStorableNode.finalize.apply(this)
		this.setTitle("my posts")
	},
	
	deleteAll: function() {
	    this.subnodes().forEach((post) => {
	        post.prepareToDelete()
	    })
	    this.removeAllSubnodes()
	    return this
	},
})