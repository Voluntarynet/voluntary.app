"use strict"

/*

    BMBlacklists

*/

window.BMBlacklists = class BMBlacklists extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
            servers: null,
            peers: null,
            contacts: null,
        })
    }

    init () {
        super.init()	
        this.setShouldStore(true)
 		this.setShouldStoreSubnodes(true)
        this.setTitle("Blacklists")
        
        this.initStoredSubnodeSlotWithProto("servers", BMBlacklistedServers)
        this.initStoredSubnodeSlotWithProto("peers", BMBlacklistedPeers)
        this.initStoredSubnodeSlotWithProto("contacts", BMBlacklistedContacts)
        
        this.addStoredSlots(["servers", "peers", "contacts"])
    }
	
}.initThisClass()
