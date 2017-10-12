
"use strict"

window.BMChat = BMApplet.extend().newSlots({
    type: "BMChat",
	//feedPosts: null,
	//myPosts: null,
   // threads: null,
}).setSlots({
    
    init: function () {
        BMApplet.init.apply(this)

        this.setShouldStore(true)
		this.setShouldStoreSubnodes(false)
		
        this.setTitle("Chat")

		this.initStoredSubnodeSlotWithProto("feedPosts", BMFeedPosts)	
		this.initStoredSubnodeSlotWithProto("myPosts",   BMMyPosts)
		this.initStoredSubnodeSlotWithProto("threads",   BMChatThreads)
		this.initStoredSubnodeSlotWithProto("drafts",    BMPostDrafts)
    },

/*
	finalizeLoad: function() {
		BMApplet.finalizeLoad.apply(this)		
	},
	*/
	
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
		}
		return this
	},
	
    handleAppMsg: function(msg) {
		//console.log(this.nodePathString() + " handleAppMsg " + msg.typeId() + " ", msg.dataDict())
		if (msg.type() == BMChatMessage.type()) {
			this.handleSentMessage(msg)
			this.handleReceivedMessage(msg)
		}
    },

	handleSentMessage: function(msg) {
        if (msg.senderId() && msg.senderId().equals(this.localIdentity())) {
			var thread = this.threads().linkForContact(msg.receiverId())
			if (thread) {
				thread.addMessage(msg.duplicate())
			}
		}
	},
	
	handleReceivedMessage: function(msg) {
        //console.log("handleReceivedMessage msg.receiverId() = ", msg.receiverId().type())
        if (msg.receiverId()) {
            //console.log("msg.receiverId() = ", msg.receiverId().type())
            if (msg.receiverId().equals(this.localIdentity())) {
 	            //console.log(this.nodePathString() + " handleReceivedMessage adding " + msg.typeId() + "  ", msg.dataDict())
   				var thread = this.threads().linkForContact(msg.senderId())
    			if (thread) {
    				thread.addMessage(msg)
    				//thread.addMessage(msg.duplicate())
    			}
    		}
    	}
	},
		
})