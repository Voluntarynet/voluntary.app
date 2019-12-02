"use strict"

/*

    BMPost

*/

window.BMPost = class BMPost extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
            price: null,
            title: null,
            description: null,
        })
        this.protoAddStoredSlots(["price", "title", "description"])
    }

    init () {
        super.init()
        this.setCanDelete(true)
        this.setNodeMinWidth(550)
        
        this.setTitle("Untitled")
        this.setPrice(0)
        this.setDescription("Description")
    }
    
    subtitle () {
        return this.price() + " BTC"
    }
    
    setPrice (p) {
        this._price = parseFloat(p)
        return this
    }
    
    postDict () {
        return {
            title: this.title(),
            price: this.price(),
            description: this.description(),
        }
    }
    
    setPostDict (aDict) {
        this.setTitle(aDict.title)
        this.setPrice(aDict.price)
        this.setDescription(aDict.description)
        return this
    }
    
    send () {
        this.log("post")

        const objMsg = BMObjectMessage.clone()
        
        objMsg.setContentDict(this.postDict())
        
        const myId = App.shared().network().localIdentities().current()
        const toId = App.shared().network().openIdentity().current()

        objMsg.send()
    }
    
    onDropFiles (filePaths) {
        let parts = []
    }

}.initThisClass()
