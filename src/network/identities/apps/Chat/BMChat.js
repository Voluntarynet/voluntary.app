
BMChat = BMApplet.extend().newSlots({
    type: "BMChat",
    threads: null,
    newThread: null,
}).setSlots({
    
    init: function () {
        BMApplet.init.apply(this)
        this.setShouldStore(true)
         this.setTitle("Chat")
        
		this.setThreads(BMChatThreads.clone())
        this.addItem(this.threads())
        
		this.setNewThread(BMChatNewThread.clone())
        this.addItem(this.newThread())
    },
})

