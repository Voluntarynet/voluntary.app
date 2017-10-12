
"use strict"

window.BMMyPosts = BMStorableNode.extend().newSlots({
    type: "BMMyPosts",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        //this.setLinkProto(BMChatThread)
		this.setTitle("my posts")
        //this.setActions(["add"])
        this.setShouldStore(true)	
        this.setNodeMinWidth(450)
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
})