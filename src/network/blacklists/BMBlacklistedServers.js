/*


*/

BMBlacklistedServers = BMBlacklist.extend().newSlots({
    type: "BMBlacklistedServers",
    ipsDict: null, 
}).setSlots({
    init: function () {
        BMBlacklist.init.apply(this)		
        this.setShouldStore(true)        
        this.setTitle("servers")
		this.addStoredSlot("ipsDict")
    },
	
})
