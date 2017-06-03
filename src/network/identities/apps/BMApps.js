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

    addApps: function() {
        var appProtos = [BMMail, BMTwitter, BMGroupChat] //, BMChat, BMClassifieds, BMBitcoinWallet]
        
        appProtos.forEach((appProto) => {
            this.addItem(appProto.clone())
        })     
        
        return this
    },
    
    appNamed: function(name) {
        return this.firstItemWithTitle(name)
    },

	handleMessage: function(aMessage) {
		this.items().forEach((app) => { app.handleMessage(aMessage) })
	},
})

