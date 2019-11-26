"use strict"

/*

    BMBlacklistedPeers

    
*/


BMBlacklist.newSubclassNamed("BMBlacklistedPeers").newSlots({
}).setSlots({
    init: function () {
        BMBlacklist.init.apply(this)		
        this.setShouldStore(true)        
        this.setTitle("peers")
    },
	
}).initThisProto()
