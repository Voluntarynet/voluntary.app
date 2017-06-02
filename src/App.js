/*
    App is a singleton that represents the application
*/

App = BaseApp.extend().newSlots({
    type: "App",
    
    apps: null,
    
    // market
	localIdentities: null,
	remoteIdentities: null,
    
    network: null,   
	dataStore: null, 
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
        
        this.setName("Bitcom")
        this.setTitle("App")

		//this.addAppItem()
		
        // ids

		this.setLocalIdentities(NodeStore.shared().rootInstanceWithPidForProto("_localIdentities", BMLocalIdentities))
		this.addItem(this.localIdentities())
		
		this.setRemoteIdentities(NodeStore.shared().rootInstanceWithPidForProto("_remoteIdentities", BMRemoteIdentities))
		this.addItem(this.remoteIdentities())

		// about 
		
        this.setAbout(BMNode.clone().setTitle("About").setSubtitle(null))
        this.about()  
        this.addItem(this.about())

		// -----------------------
		
    		// network

    		this.setNetwork(BMNetwork.clone())
    		this.network().setLocalIdentities(this.localIdentities())
    		this.network().setRemoteIdentities(this.remoteIdentities())
    		this.about().addItem(this.network())

    		// data store
		
    		this.setDataStore(BMDataStore.clone())
    		this.about().addItem(this.dataStore())
		
            if (this.network()) {
                this.network().servers().connect()
            }

        return this
    },

/*
	addAppItem: function() {        
        this.setApps(BMNode.clone().setTitle("Apps"))
        this.addItem(this.apps())
        this.addApps()	
		return this
	},
    
    addApps: function() {
        var appProtos = [BMTwitter, BMChat, BMGroupChat, BMClassifieds, BMBitcoinWallet]
        
        appProtos.forEach((appProto) => {
            this.apps().addItem(appProto.sharedStoredInstance())
        })     
        
        return this
    },
    
    appNamed: function(name) {
        return this.apps().firstItemWithTitle(name)
    },
*/

})

