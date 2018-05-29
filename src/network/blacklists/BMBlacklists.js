/*


*/

"use strict"

window.BMBlacklists = BMStorableNode.extend().newSlots({
    type: "BMBlacklists",
    servers: null,
    peers: null,
    contacts: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)		
        this.setShouldStore(true)
 		this.setShouldStoreSubnodes(true)
        this.setTitle("Blacklists")
        
        this.initStoredSubnodeSlotWithProto("servers", BMBlacklistedServers)
        this.initStoredSubnodeSlotWithProto("peers", BMBlacklistedPeers)
        this.initStoredSubnodeSlotWithProto("contacts", BMBlacklistedContacts)
        
        this.addStoredSlots(["servers", "peers", "contacts"])
    },
	
})
