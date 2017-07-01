
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
		this.setupItems()
    },

	didLoadFromStore: function() {
		console.log(this + " didLoadFromStore ")
		this.setupItems()
		return this
	},
	
    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },


	setupItems: function() {
		console.log(this + " setupItems ")
		this.addItemProtoForSlotIfAbsent(BMChatThreads, "threads") 
		this.addItemProtoForSlotIfAbsent(BMChatNewThread, "newThread")
		return this
	},
	
})

