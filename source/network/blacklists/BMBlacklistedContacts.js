"use strict"

/*

    BMBlacklistedContacts

*/


window.BMBlacklistedContacts = BMBlacklist.extend().newSlots({
    type: "BMBlacklistedContacts",
}).setSlots({
    init: function () {
        BMBlacklist.init.apply(this)		
        this.setShouldStore(true)        
        this.setTitle("contacts")
    },
	
})
