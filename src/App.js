/*
    App is a singleton that represents the application
    It's superclass, BaseApp will set up the NodeStore and call App.setup after it's initialized.
    After setup, appDidInit is called.
*/

App = BaseApp.extend().newSlots({
    type: "App",
	localIdentities: null,
	remoteIdentities: null,
    network: null,   
	dataStore: null, 
}).setSlots({
    init: function () {
        BaseApp.init.apply(this)
    },
    
    setup: function () {       
        BaseApp.setup.apply(this)
        window.app = this        
        this.setupPageTitle()
        this.setupSubnodes()
        return this
    },
    
    setupPageTitle: function() {
		var name = WebBrowserWindow.urlHostname()
		
		if (name != "") {
			name = name.before(".").replaceAll("-", " ").toUpperCase()
		} else {
			name = "T E S T"
		}

        this.setName(name)
        this.setTitle(name)
        return this        
    },
    
    setupSubnodes: function() {
		
        // ids

		this.setLocalIdentities(NodeStore.shared().rootInstanceWithPidForProto("_localIdentities", BMLocalIdentities))
		this.addSubnode(this.localIdentities())
		
		this.setRemoteIdentities(NodeStore.shared().rootInstanceWithPidForProto("_remoteIdentities", BMRemoteIdentities))
		this.addSubnode(this.remoteIdentities())

		// about 
		
        this.setAbout(BMNode.clone().setTitle("About").setSubtitle(null))
        this.about()  
        this.addSubnode(this.about())

		// --- about subnodes --------------------
		
   		// network

   		this.setNetwork(BMNetwork.clone())
   		this.network().setLocalIdentities(this.localIdentities())
   		this.network().setRemoteIdentities(this.remoteIdentities())
   		this.about().addSubnode(this.network())

   		// data store
	
   		this.setDataStore(BMDataStore.clone())
   		this.about().addSubnode(this.dataStore())
	
        this.network().servers().connect()

		this.appDidInit()
		
        return this
    },
    
	appDidInit: function() {
        BaseApp.appDidInit.apply(this)

		LoadProgressBar.stop()  

        setTimeout(() => {
            this.browser().syncFromHashPath()
        }, 100)
	},
})

