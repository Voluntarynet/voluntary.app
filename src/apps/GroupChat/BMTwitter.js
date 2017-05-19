
BMGroupChat = BMStorableNode.extend().newSlots({
    type: "BMGroupChat",
    channels: null,
    directMessages: null,
    profile: null,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setTitle("BMGroupChat")
        
        /*
        this.setRegions(BMRegions.clone())
        this.addItem(this.regions())
        
		this.setSells(NodeStore.shared().rootInstanceWithPidForProto("_sells", BMSells))
        this.addItem(this.sells())
        */
    },
})

