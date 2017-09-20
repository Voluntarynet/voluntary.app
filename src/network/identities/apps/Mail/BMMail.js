
"use strict"

window.BMMail = BMApplet.extend().newSlots({
    type: "BMMail",
    feed: null,
    drafts: null,
    notifications: null,
    messages: null,
    profile: null,
    following: null,
    followers: null,
}).setSlots({
    init: function () {
        BMApplet.init.apply(this)
        this.setTitle("Mail")

        this.initStoredSubnodeSlotWithProto("drafts", BMDrafts)
        this.initStoredSubnodeSlotWithProto("inbox", BMInbox)
        this.initStoredSubnodeSlotWithProto("sent", BMSent)        
    },
	
    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },

    
    handleMessage: function(msg) {
		if (msg.type() == BMMailMessage.type()) {
			this.handleSentMessage(msg)
			this.handleReceivedMessage(msg)
		}
    },

	handleSentMessage: function(msg) {
        if (this.localIdentity().equals(msg.senderId())) {
			this.sent().addSubnodeIfAbsent(msg)
		}		
	},
	
	handleReceivedMessage: function(msg) {
		if (this.localIdentity().equals(msg.receiverId())) {
			this.inbox().addSubnodeIfAbsent(msg)
		}		
	},
})

