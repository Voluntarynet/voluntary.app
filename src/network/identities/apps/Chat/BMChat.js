
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
	loadFinalize: function() {
		BMApplet.loadFinalize.apply(this)		
	},
	*/
	
    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },

    remoteIdentities: function() {
        return this.localIdentity().remoteIdentities()
    },

/*
	setThreads: function(newValue) {
		var oldValue = this._threads
		this._threads = newValue
		this.didUpdateSlot("threads", oldValue, newValue)
		
		if (newValue == null) {
			console.warn(this.typeId() + ".setThreads oldValue:", oldValue, " newValue:", newValue)
		}
		return this
	},
	*/
	
    handleAppMsg: function(msg) {
		console.log("  " + this.localIdentity().title() + " app " + this.typeId() + ".handleAppMsg(" + msg.typeId() + ") ") //, msg.dataDict())
		
		if (msg.type() == BMChatMessage.type()) {
			this.handleSentMessage(msg)
			this.handleReceivedMessage(msg)
		}
		
		if (msg.type() == BMPostMessage.type()) {
		    //console.log("found BMPostMessage")
		    
		    var spk = msg.senderPublicKeyString()
            var senderId = this.localIdentity().idForPublicKeyString(spk)
		    //console.log("this.localIdentity().idForPublicKeyString(spk) = ", this.localIdentity().idForPublicKeyString(spk))
		    
		    if (senderId) {		        
		        console.log("  placing in " + this.localIdentity().title() + " feedPosts")
			    this.feedPosts().addSubnode(msg.duplicate())
		    } else {
				console.log("  no senderId, can't put in feeds")
			}
		    
		    //console.log(this.localIdentity().title() + " " + this.localIdentity().publicKeyString() + " =?= " + spk)
		    
		    if (this.localIdentity().publicKeyString() == spk) {
		        console.log("  placing in " + this.localIdentity().title() + " myPosts")
			    this.myPosts().addSubnode(msg.duplicate())
		    } else {
				console.log("  sender isn't local id, can't put in myPosts")
			}
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

