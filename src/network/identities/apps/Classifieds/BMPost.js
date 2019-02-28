
"use strict"

window.BMPost = BMStorableNode.extend().newSlots({
    type: "BMPost",
    price: null,
    title: null,
    description: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setActions(["delete"])
        this.setNodeMinWidth(550)
        
        this.setTitle("Untitled")
        this.setPrice(0)
        this.setDescription("Description")
        this.addStoredSlots(["price", "title", "description"])
    },
    
    subtitle: function() {
        return this.price() + " BTC"
    },
    
    setPrice: function(p) {
        this._price = parseFloat(p)
        return this
    },
    
    postDict: function () {
        return {
            title: this.title(),
            price: this.price(),
            description: this.description(),
        }
    },
    
    setPostDict: function(aDict) {
        this.setTitle(aDict.title)
        this.setPrice(aDict.price)
        this.setDescription(aDict.description)
        return this
    },
    
    send: function () {
        this.log("post")

        let objMsg = BMObjectMessage.clone()
        
        objMsg.setContentDict(this.postDict())
        
        let myId = App.shared().network().localIdentities().current()
        let toId = App.shared().network().openIdentity().current()

        objMsg.send()
    },
    
    onDropFiles: function(filePaths) {
        let parts = []
    },

})
