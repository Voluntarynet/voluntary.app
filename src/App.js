/*
    App is a singleton that represents the application
*/

/*
document.ontouchmove = function(event){
    event.preventDefault();
}

document.body.ontouchmove = function(event){
    event.preventDefault();
}
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

    setup: function () {       
        BaseApp.setup.apply(this)
        
        window.app = this
        
		var parser = document.createElement('a')
		console.log(" window.location.href = ",  window.location.href)
		parser.href = window.location.href
		var name = parser.hostname
		console.log("parser.hostname = ",  typeof(parser.hostname))
		
		if (name != "") {
			name = name.before(".").replaceAll("-", " ").toUpperCase()
		} else {
			name = "TEST"
		}

        this.setName(name)
        this.setTitle("App")
		
        // ids

		this.setLocalIdentities(NodeStore.shared().rootInstanceWithPidForProto("_localIdentities", BMLocalIdentities))
		this.addSubnode(this.localIdentities())
		
		this.setRemoteIdentities(NodeStore.shared().rootInstanceWithPidForProto("_remoteIdentities", BMRemoteIdentities))
		this.addSubnode(this.remoteIdentities())

		// about 
		
        this.setAbout(BMNode.clone().setTitle("About").setSubtitle(null))
        this.about()  
        this.addSubnode(this.about())

		// -----------------------
		
    		// network

    		this.setNetwork(BMNetwork.clone())
    		this.network().setLocalIdentities(this.localIdentities())
    		this.network().setRemoteIdentities(this.remoteIdentities())
    		this.about().addSubnode(this.network())

    		// data store
		
    		this.setDataStore(BMDataStore.clone())
    		this.about().addSubnode(this.dataStore())
		
            if (this.network()) {
                this.network().servers().connect()
            }

        return this
    },

})

