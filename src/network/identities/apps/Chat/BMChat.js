
BMChat = BMApplet.extend().newSlots({
    type: "BMChat",
    threads: null,
}).setSlots({
    
    init: function () {
        BMApplet.init.apply(this)

        this.setShouldStore(true)
		this.setShouldStoreSubnodes(false)
		
        this.setTitle("Chat")

		this.addStoredSlot("threads")
		this.setThreads(BMChatThreads.clone())
		this.addSubnode(this.threads())
		
		//console.log(">>>>>>> " + this.typeId() + ".init()")
    },
	
    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },

    remoteIdentities: function() {
        return this.localIdentity().remoteIdentities()
    },

	setThreads: function(newValue) {
		var oldValue = this._threads
		this._threads = newValue
		this.didUpdateSlot("threads", oldValue, newValue)
		
		if (newValue == null) {
			console.warn(this.typeId() + ".setThreads oldValue:", oldValue, " newValue:", newValue)
			//debugger;
			//throw new Error("setting chat threads to null!")
			//ShowStack()
		}
		return this
	},
	
    handleMessage: function(msg) {
		if (msg.type() == BMChatMessage.type()) {
			msg = msg.duplicate()
			this.handleSentMessage(msg)
			this.handleReceivedMessage(msg)
		}
    },

	handleSentMessage: function(msg) {
        if (msg.senderId() && msg.senderId().equals(this.localIdentity())) {
			var thread = this.threads().threadForRemoteIdentity(msg.receiverId())
			if (thread) {
				thread.addMessage(msg)
			}
		}		
	},
	
	handleReceivedMessage: function(msg) {
        if (msg.receiverId()) {
            //console.log("msg.receiverId() = ", msg.receiverId().type())
            if (msg.receiverId().equals(this.localIdentity())) {
    			var thread = this.threads().threadForRemoteIdentity(msg.senderId())
    			if (thread) {
    				thread.addMessage(msg)
    			}
    		}
    	}
	},
		
})

