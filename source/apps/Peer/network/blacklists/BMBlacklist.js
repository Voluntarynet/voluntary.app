"use strict"

/*

    BMBlacklist
    
*/

window.BMBlacklist = class BMBlacklist extends BMStorableNode {
    
    initPrototype () {

    }

    init () {
        super.init()
        this.setShouldStore(true)	
 		this.setShouldStoreSubnodes(true)
        this.setTitle("Blacklist")
	    this.addAction("add")
        this.setSubnodeProto(BMBlacklistEntry)
        this.setNoteIsSubnodeCount(true)
    }
	
}.initThisClass()
