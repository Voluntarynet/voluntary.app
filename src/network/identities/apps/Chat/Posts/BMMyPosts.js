
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
		this.setNodeColumnBackgroundColor("white")
		this.setNoteIsSubnodeCount(true)
		
		this.setSubnodeSortFunc(function (postMsg1, postMsg2) {
		    return postMsg1.ageInSeconds() - postMsg2.ageInSeconds()
		})
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
	
	shelfIconName: function() {
		return "chat/feed_a"
//	    return "home3-white"
	},
})