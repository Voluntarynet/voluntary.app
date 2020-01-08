"use strict"

/*

    BMMyPosts

*/

window.BMMyPosts = class BMMyPosts extends BMStorableNode {
    
    initPrototype () {

    }

    init () {
        super.init()
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
    }

    finalize () {
        super.finalize()
        this.setTitle("my posts")
    }
	
    deleteAll () {
	    this.subnodes().forEach((post) => {
	        post.prepareToDelete()
	    })
	    this.removeAllSubnodes()
	    return this
    }
	
    shelfIconName () {
        return "chat/feed_a"
        //	    return "home3-white"
    }
    
}.initThisClass()