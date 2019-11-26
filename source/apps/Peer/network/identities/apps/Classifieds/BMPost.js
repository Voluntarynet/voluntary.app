"use strict"

/*

    BMPost

*/


BMStorableNode.newSubclassNamed("BMPost").newSlots({
    price: null,
    title: null,
    description: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setCanDelete(true)
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

        const objMsg = BMObjectMessage.clone()
        
        objMsg.setContentDict(this.postDict())
        
        const myId = App.shared().network().localIdentities().current()
        const toId = App.shared().network().openIdentity().current()

        objMsg.send()
    },
    
    onDropFiles: function(filePaths) {
        let parts = []
    },

}).initThisProto()
