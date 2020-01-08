"use strict"

/*

    BMFeedPosts

*/

window.BMFeedPosts = class BMFeedPosts extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("hasRead", true)
    }

    init () {
        super.init()
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
    }

    finalize () {
        super.finalize()
        this.setTitle("feed")
    }
	
    deleteAll () {
	    this.subnodes().forEach((post) => {
	        post.prepareToDelete()
	    })
	    this.removeAllSubnodes()
	    return this
    }
	
    chat () {
	    return this.parentNode()
    }
	
    localIdentity () {
        return this.chat().localIdentity()
    }
	
    shelfIconUrl () {
	    return this.localIdentity().profile().profileImageDataUrl()
    }
	
    // hasRead
	
    firstUnreadPost () {
	    return this.subnodes().detect(post => !post.hasRead())
    }
    
    updateHasRead () {
        this.setHasRead(this.firstUnreadPost() === null)
        return this
    }
    
    didChangeSubnodeList () {
        super.didChangeSubnodeList()
        this.updateHasRead()
        return this
    }
    
    didUpdateNode () {
        super.didUpdateNode()
        this.updateHasRead()
    }
    
    nodeViewShouldBadge () {
        return !this.hasRead()
    }

}.initThisClass()