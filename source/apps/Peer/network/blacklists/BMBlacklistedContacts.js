"use strict"

/*

    BMBlacklistedContacts

*/


BMBlacklist.newSubclassNamed("BMBlacklistedContacts").newSlots({
}).setSlots({
    init: function () {
        BMBlacklist.init.apply(this)		
        this.setShouldStore(true)        
        this.setTitle("contacts")
    },
	
}).initThisProto()
