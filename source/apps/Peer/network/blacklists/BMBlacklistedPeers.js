"use strict"

/*

    BMBlacklistedPeers

    
*/

window.BMBlacklistedPeers = class BMBlacklistedPeers extends BMBlacklist {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()	
        this.setShouldStore(true)        
        this.setTitle("peers")
    }
	
}.initThisClass()
