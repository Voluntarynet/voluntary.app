
BMSell = BMStorableNode.extend().newSlots({
    type: "BMSell",
    post: null,
	hasSent: false,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setShouldStore(true)
		this.setShouldStoreItems(true)
		
        this.setTitle("Sell")
        this.setActions(["delete"])
        //this.setSubtitle(Math.floor(Math.random()*10000))
        this.addStoredSlots(["subtitle", "hasSent"])
        
        this.setPost(BMClassifiedPost.clone())
        this.addItem(this.post())
    },

    
    subtitle: function() {
        return this.post().subtitle()
    },

})
