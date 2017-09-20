/*
	a per-identity instantiated collection of apps

*/


"use strict"

window.BMApps = BMStorableNode.extend().newSlots({
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
        return [BMChat] //BMMail, BMTwitter, BMGroupChat] //, BMChat, BMClassifieds, BMBitcoinWallet]
	},

    addApps: function() {
		this.addAnyMisingApps()
		this.removeAnyExtraApps()
        return this
    },

	removeAnyExtraApps: function() {
		// remove any apps not in appProtos
		var types = this.appProtos().map((proto) => { return proto.type() })
		var matches = this.apps().select((app) => { return types.contains(app.type()) })
		this.setSubnodes(matches)		
	},

	addAnyMisingApps: function() {
        this.appProtos().forEach((appProto) => {
            this.addAppTypeIfMissing(appProto)
        })
		return this
	},

	addAppTypeIfMissing: function(appProto) {
		//console.log(this.typeId() + ".addAppTypeIfMissing(" + appProto.type() + ")")
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

	handleAppMsg: function(aMessage) {
		this.subnodes().forEach((app) => { app.handleAppMsg(aMessage) })
	},
})

