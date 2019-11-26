"use strict"


/*

    BMBlacklistedServers

    
*/

BMBlacklist.newSubclassNamed("BMBlacklistedServers").newSlots({
    ipsDict: null, 
}).setSlots({
    init: function () {
        BMBlacklist.init.apply(this)		
        this.setShouldStore(true)        
        this.setTitle("servers")
        this.addStoredSlot("ipsDict")
    },
	
}).initThisProto()
