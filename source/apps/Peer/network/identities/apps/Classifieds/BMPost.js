"use strict"

/*

    BMPost

*/

window.BMPost = class BMPost extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("price", null).setShouldStoreSlot(true)
        this.overrideSlot("title", null).setShouldStoreSlot(true)
        this.newSlot("description", null).setShouldStoreSlot(true)
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
    
    didUpdateSlotPrice (oldValue, newValue) {
        this._price = parseFloat(newValue)
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
