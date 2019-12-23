"use strict"

/*

    BMBlacklists

*/

window.BMBlacklists = class BMBlacklists extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("servers", null).setShouldStoreSlot(true).setInitProto(BMBlacklistedServers)
        this.newSlot("peers", null).setShouldStoreSlot(true).setInitProto(BMBlacklistedPeers)
        this.newSlot("contacts", null).setShouldStoreSlot(true).setInitProto(BMBlacklistedContacts)

        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
    }

    init () {
        super.init()	
        this.setTitle("Blacklists")
    }
	
}.initThisClass()
