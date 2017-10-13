
"use strict"

window.BMMyPosts = BMStorableNode.extend().newSlots({
    type: "BMMyPosts",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        //this.setLinkProto(BMChatThread)
		this.setTitle("my posts")
        this.setActions(["add", "deleteAll"])
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
	
	/*
	add: function() {
        var newPost = BMPostDraft.clone()
		this.parentNode().drafts().addSubnode(newPost)
		setTimeout(() => {
			App.shared().browser().selectNode(newPost)
		}, 10)
        return newPost
	},
	*/
	
	deleteAll: function() {
	    this.subnodes().forEach((post) => {
	        post.prepareToDelete()
	    })
	    this.removeAllSubnodes()
	    return this
	},
})