/*
	a per-identity instantiated collection of apps

*/


BMApps = BMStorableNode.extend().newSlots({
    type: "BMApps",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setTitle("apps")
        this.setShouldStore(true)
		this.addApps()
    },	

	didLoadFromStore: function() {
		this.addApps()
		return this
	},

    addApps: function() {
        var appProtos = [BMMail, BMChat] //BMTwitter, BMGroupChat] //, BMChat, BMClassifieds, BMBitcoinWallet]
        
        appProtos.forEach((appProto) => {
            this.addAppTypeIfMissing(appProto)
        })     
        
        return this
    },

	addAppTypeIfMissing: function(appProto) {
		if (this.hasAppType(appProto) == false) {
        	this.addItem(appProto.clone())
		}
		return this
	},
	
	hasAppType: function(appProto) {
		return this.apps().detect((app) => { return app.type() == appProto.type() }) != null
	},

	apps: function() {
		return this.items()
	},
    
    appNamed: function(name) {
        return this.firstItemWithTitle(name)
    },

	handleMessage: function(aMessage) {
		this.items().forEach((app) => { app.handleMessage(aMessage) })
	},
})

