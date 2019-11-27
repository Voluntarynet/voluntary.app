"use strict"

/*

    BMPostDrafts

*/

window.BMPostDrafts = class BMPostDrafts extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
        })
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
        BMStorableNode.finalize.apply(this)
        this.setTitle("my drafts")
    }
	

    add () {
        const result = BMStorableNode.add.apply(this)
        this.scheduleSyncToStore()
        this.didUpdateNode()
        return result
    }

    /*
	scheduleSyncToStore () {
		BMStorableNode.scheduleSyncToStore.apply(this)
        this.debugLog(" scheduleSyncToStore")
		return this
	},
	*/
	
    shelfIconName () {
	    return "chat/drafts"
	    //return "write-white"
    }
	
    // badge - a badge without a title becomes a marker
	
    nodeViewShouldBadge () {
        return this.subnodesCount() > 0
    }
    
}.initThisClass()