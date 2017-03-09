/*
    App is a singleton that represents the application
*/

App = BaseApp.extend().newSlots({
    type: "App",
    
    // market
    marketMode: true,    
    market: null,
    buys: null,
    sells: null,
    
    wallet: null,
    
    network: null,
    
    myPosts: null,
}).setSlots({
    init: function () {
        BaseApp.init.apply(this)
        this.setNodeMinWidth(170)        
    },

    setup: function () {       
        BaseApp.setup.apply(this)
        
        window.app = this
        
        this.setName("Bitmarkets")
        this.setTitle("App")
                    
        // setup child nodes
        if (this.marketMode()) {
            this.initStoredSlotWithProto("market", BMMarket)
            //this.initStoredSlotWithProto("buys", BMBuys)
            //this.initStoredSlotWithProto("sells", BMSells)
            this.initStoredSlotWithProto("myPosts", BMClassifiedPosts)
            //this.initStoredSlotWithProto("wallet", BMWallet)
        }

        if (true) {
            this.initStoredSlotWithProto("network", BMNetwork)
        }

        //this.initStoredSlotWithProto("about", BMInfoNode)

        /*
        this.initStoredSlotWithProto("Posts", BMInfoNode)
        this.initStoredSlotWithProto("My Publications", BMInfoNode)
        this.initStoredSlotWithProto("My Purchases", BMInfoNode)
        this.initStoredSlotWithProto("wallet", BMInfoNode)
        */

        this.setAbout(BMInfoNode.clone().setTitle("About")).setSubtitle(null)
        this.about().setPidSymbol("_about")     
        this.addItem(this.about())
        this.addStoredSlots(["about"])
        
        this.load()
        
        if (this.network()) {
            this.network().servers().connect()
        }
        return this
    },
    
    load: function() {
        NodeStore.clear();
        NodeStore.shared().setRootObject(this)
        return this
    },

})
