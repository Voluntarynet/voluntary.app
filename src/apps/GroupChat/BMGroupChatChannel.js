
BMGroupChat = BMApplet.extend().newSlots({
    type: "BMGroupChat",
    channels: null,
    directMessages: null,
    profile: null,
}).setSlots({
    init: function () {
        BMApplet.init.apply(this)
        this.setTitle("Group Chat")
        
        /*
        this.setRegions(BMRegions.clone())
        this.addItem(this.regions())
        
		this.setSells(NodeStore.shared().rootInstanceWithPidForProto("_sells", BMSells))
        this.addItem(this.sells())
        */
    },
})

