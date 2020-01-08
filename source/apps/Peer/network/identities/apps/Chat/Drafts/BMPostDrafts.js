"use strict"

/*

    BMPostDrafts

*/

window.BMPostDrafts = class BMPostDrafts extends BMStorableNode {
    
    initPrototype () {

    }

    init () {
        super.init()
        //this.setLinkProto(BMChatThread)
        this.setShouldStore(true)	
        this.setShouldStoreSubnodes(true)	
        this.setNodeMinWidth(450)
        this.setSubnodeProto(BMPostDraft)
        this.addActions(["add"])

        this.setNodeColumnBackgroundColor("white")
        this.setNoteIsSubnodeCount(true)
        this.setTitle("my drafts")
    }

    finalize () {
        super.finalize()
        this.setTitle("my drafts")
    }

    add () {
        const result = super.add()
        this.scheduleSyncToStore()
        this.didUpdateNode()
        return result
    }
	
    shelfIconName () {
	    return "chat/drafts"
	    //return "write-white"
    }
	
    // badge - a badge without a title becomes a marker
	
    nodeViewShouldBadge () {
        return this.subnodesCount() > 0
    }
    
}.initThisClass()