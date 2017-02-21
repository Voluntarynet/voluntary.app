
BMBuy = BMStorableNode.extend().newSlots({
    type: "BMBuy",
    post: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setTitle("Buy")
        this.setActions(["delete"])
        this.setSubtitle(Math.floor(Math.random()*10000))
        this.addStoredSlot("subtitle")
    },
    
    setPost: function(aPost) {
        if (this.post()) {
            this.removeItem(this.post())
        }
        
        this._post = aPost
        this.addItem(aPost)
        return this
    },

})
