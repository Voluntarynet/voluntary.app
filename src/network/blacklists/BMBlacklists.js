/*


*/

BMBlacklists = BMStorableNode.extend().newSlots({
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
        
        this.initStoredSlotWithProto("servers", BMBlacklistedServers)
        this.initStoredSlotWithProto("peers", BMBlacklistedPeers)
        this.initStoredSlotWithProto("contacts", BMBlacklistedContacts)
        
		this.addStoredSlots(["servers", "peers", "contacts"])
    },
	
})
