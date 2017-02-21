
BMSell = BMStorableNode.extend().newSlots({
    type: "BMSell",
    post: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setTitle("Sell")
        this.setActions(["delete"])
        this.setSubtitle(Math.floor(Math.random()*10000))
        this.addStoredSlot("subtitle")
        
        this.setPost(BMPost.clone())
        this.addItem(this.post())
    },
})
