"use strict"

/*

    BMBlacklistedContacts

*/

window.BMBlacklistedContacts = class BMBlacklistedContacts extends BMBlacklist {
    
    initPrototype () {
        this.newSlots({
        })
    }

    init () {
        super.init()		
        this.setShouldStore(true)        
        this.setTitle("contacts")
    }
	
}.initThisClass()
