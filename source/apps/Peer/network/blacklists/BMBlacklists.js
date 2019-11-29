"use strict"

/*

    BMBlacklists

*/

window.BMBlacklists = class BMBlacklists extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("servers", null).setShouldStore(true).setInitProto(BMBlacklistedServers)
        this.newSlot("peers", null).setShouldStore(true).setInitProto(BMBlacklistedPeers)
        this.newSlot("contacts", null).setShouldStore(true).setInitProto(BMBlacklistedContacts)

        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
    }

    init () {
        super.init()	
        this.setTitle("Blacklists")
    }
	
}.initThisClass()
