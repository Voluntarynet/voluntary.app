/*


*/

BMBlacklistedPeers = BMBlacklist.extend().newSlots({
    type: "BMBlacklistedPeers",
}).setSlots({
    init: function () {
        BMBlacklist.init.apply(this)		
        this.setShouldStore(true)        
        this.setTitle("Peers")
    },
	
})
