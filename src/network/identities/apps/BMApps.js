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
	
	appProtos: function() {
        return [BMMail, BMChat] //BMTwitter, BMGroupChat] //, BMChat, BMClassifieds, BMBitcoinWallet]
	},

    addApps: function() {
	
		// add any missing apps
        this.appProtos().forEach((appProto) => {
            this.addAppTypeIfMissing(appProto)
        })

		// remove any apps not in appProtos
		var types = this.appProtos().map((proto) => { return proto.type() })
		var matches = this.apps().select((app) => { return types.contains(app.type()) })
		this.setSubnodes(matches)
        
        return this
    },

	addAppTypeIfMissing: function(appProto) {
		if (this.hasAppType(appProto) == false) {
        	this.addSubnode(appProto.clone())
		}
		return this
	},
	
	hasAppType: function(appProto) {
		return this.apps().detect((app) => { return app.type() == appProto.type() }) != null
	},

	apps: function() {
		return this.subnodes()
	},
    
    appNamed: function(name) {
        return this.firstSubnodeWithTitle(name)
    },

	handleMessage: function(aMessage) {
		this.subnodes().forEach((app) => { app.handleMessage(aMessage) })
	},
})

