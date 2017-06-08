/*


*/

BMBlacklistedContacts = BMBlacklist.extend().newSlots({
    type: "BMBlacklistedContacts",
}).setSlots({
    init: function () {
        BMBlacklist.init.apply(this)		
        this.setShouldStore(true)        
        this.setTitle("Contacts")
        this.setNodeMinWidth(150)
    },
	
})
