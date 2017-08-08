
BMChat = BMApplet.extend().newSlots({
    type: "BMChat",
    threads: null,
    newThread: null,
}).setSlots({
    
    init: function () {
        BMApplet.init.apply(this)

        this.setShouldStore(true)
		this.setShouldStoreSubnodes(false)
		
        this.setTitle("Chat")

		this.setThreads(BMChatThreads.clone())
		this.addSubnode(this.threads())
		
		this.setNewThread(BMChatNewThread.clone())
		this.addSubnode(this.newThread())
    },
	
    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },
	
})

