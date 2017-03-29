
BMSell = BMStorableNode.extend().newSlots({
    type: "BMSell",
    post: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setTitle("Sell")
        this.setActions(["delete"])
        //this.setSubtitle(Math.floor(Math.random()*10000))
        this.addStoredSlot("subtitle")
        
        this.setPost(BMClassifiedPost.clone())
        this.addItem(this.post())
    },
    
    /*
    didUpdate: function() {
        BMStorableNode.didUpdate.apply(this)
    },
    */
    
    subtitle: function() {
        return this.post().subtitle()
    },
    
    serialize: function() {
        var dict = {}
        dict.postDict = this.post().postDict()
        return dict
    },
    
    unserialize: function(dict) {
        
    },
})
