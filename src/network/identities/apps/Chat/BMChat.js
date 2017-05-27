
BMChat = BMApplet.extend().newSlots({
    type: "BMChat",
    threads: null,
    profile: null,
}).setSlots({
    
    init: function () {
        BMApplet.init.apply(this)
        this.setShouldStore(true)
         this.setTitle("Chat")
        
		this.setThreads(BMChatThreads.clone())
        this.addItem(this.threads())
    },
})

