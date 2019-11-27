"use strict"


/*

    BMBlacklistedServers

    
*/

window.BMBlacklistedServers = class BMBlacklistedServers extends BMBlacklist {
    
    initPrototype () {
        this.newSlots({
            ipsDict: null, 
        })
    }

    init () {
        super.init()	
        this.setShouldStore(true)        
        this.setTitle("servers")
        this.addStoredSlot("ipsDict")
    }
	
}.initThisClass()
