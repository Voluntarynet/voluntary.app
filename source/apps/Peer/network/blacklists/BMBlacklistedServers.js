"use strict"


/*

    BMBlacklistedServers

    
*/

window.BMBlacklistedServers = class BMBlacklistedServers extends BMBlacklist {
    
    initPrototype () {
        this.newSlots({
            ipsDict: null, 
        })
        this.protoAddStoredSlot("ipsDict")
    }

    init () {
        super.init()	
        this.setShouldStore(true)        
        this.setTitle("servers")
    }
	
}.initThisClass()
