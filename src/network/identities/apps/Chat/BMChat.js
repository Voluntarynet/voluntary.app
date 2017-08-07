
BMChat = BMApplet.extend().newSlots({
    type: "BMChat",
    threads: null,
    newThread: null,
}).setSlots({
    
    init: function () {
        BMApplet.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("Chat")
		console.log(this + " init ")
		this.setupSubnodes()
    },

	didLoadFromStore: function() {
		console.log(this + " didLoadFromStore ")
		this.setupSubnodes()
		return this
	},
	
    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },


	setupSubnodes: function() {
		console.log(this + " setupSubnodes ")
		this.addSubnodeProtoForSlotIfAbsent(BMChatThreads, "threads") 
		this.addSubnodeProtoForSlotIfAbsent(BMChatNewThread, "newThread")
		return this
	},
	
})

