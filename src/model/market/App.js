/*
    App is a singleton that represents the application
*/

App = BaseApp.extend().newSlots({
    type: "App",
    
    // market
    market: null,
    buys: null,
    sells: null,
	localIdentities: null,
	remoteIdentities: null,
    
    wallet: null,
    
    network: null,    
}).setSlots({
    init: function () {
        BaseApp.init.apply(this)
        this.setNodeMinWidth(170)        
    },

	addItemForSlot: function(anObject, slotName) {
		var setterName = this.setterNameForSlot(slotName)
		this[setterName].apply(this, [anObject])
		this.addItem(anObject)
		return this
	},

    setup: function () {       
        BaseApp.setup.apply(this)
        
        window.app = this
        
        this.setName("Bitmarkets")
        this.setTitle("App")
        
        // market
            
		//this.addItemForSlot(BMMarket.clone(), "market")
		this.setMarket(BMMarket.clone())
		this.addItem(this.market())

		this.setSells(NodeStore.shared().rootInstanceWithPidForProto("_sells", BMSells))
		this.addItem(this.sells())

        // ids

		this.setLocalIdentities(NodeStore.shared().rootInstanceWithPidForProto("_localIdentities", BMLocalIdentities))
		this.addItem(this.localIdentities())
		
		this.setRemoteIdentities(NodeStore.shared().rootInstanceWithPidForProto("_remoteIdentities", BMRemoteIdentities))
		this.addItem(this.remoteIdentities())

		// network

		this.setNetwork(BMNetwork.clone())
		this.network().setLocalIdentities(this.localIdentities())
		this.network().setRemoteIdentities(this.remoteIdentities())
		
		this.addItem(this.network())

		// about 
		
        //this.initStoredSlotWithProto("about", BMInfoNode)

        this.setAbout(BMInfoNode.clone().setTitle("About")).setSubtitle("")
        this.about() //.setPidSymbol("_about")     
        this.addItem(this.about())
        this.addStoredSlots(["about"])
                
        if (this.network()) {
            this.network().servers().connect()
        }

        return this
    },

})

