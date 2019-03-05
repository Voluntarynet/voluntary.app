"use strict"

/*

    BMFeedPosts

*/

window.BMFeedPosts = BMStorableNode.extend().newSlots({
    type: "BMFeedPosts",
    hasRead: true,
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
        this.setNodeColumnBackgroundColor("white")
        this.setNoteIsSubnodeCount(true)
		
        this.setSubnodeSortFunc(function (postMsg1, postMsg2) {
		    return postMsg1.ageInSeconds() - postMsg2.ageInSeconds()
        })
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
	
	
    chat: function() {
	    return this.parentNode()
    },
	
    localIdentity: function() {
        return this.chat().localIdentity()
    },
	
    shelfIconUrl: function() {
	    return this.localIdentity().profile().profileImageDataUrl()
    },
	
    // hasRead
	
    firstUnreadPost: function() {
	    return this.subnodes().detect(post => !post.hasRead())
    },
    
    updateHasRead: function() {
        this.setHasRead(this.firstUnreadPost() == null)
        return this
    },
    
    didChangeSubnodeList: function() {
        BMStorableNode.didChangeSubnodeList.apply(this)
        this.updateHasRead()
        return this
    },
    
    didUpdateNode: function() {
        BMStorableNode.didUpdateNode.apply(this)
        this.updateHasRead()
    },
    
    nodeViewShouldBadge: function() {
        return !this.hasRead()
    },
})