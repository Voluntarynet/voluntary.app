/*


*/

BMBlacklistedServers = BMBlacklist.extend().newSlots({
    type: "BMBlacklistedServers",
    ipsDict: null, 
}).setSlots({
    init: function () {
        BMBlacklist.init.apply(this)		
        this.setShouldStore(true)        
        this.setTitle("Servers")
        this.setNodeMinWidth(150)
		this.addStoredSlot("ipsDict")
    },
	
})
