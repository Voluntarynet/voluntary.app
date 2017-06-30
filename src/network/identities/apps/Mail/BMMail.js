
BMMail = BMApplet.extend().newSlots({
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

        this.initStoredSlotWithProto("drafts", BMDrafts)
        this.initStoredSlotWithProto("inbox", BMInbox)
        this.initStoredSlotWithProto("sent", BMSent)        

    },

	identity: function() {
		return this.parentNode().parentNode()
	},
    
    handleMessage: function(msg) {
        var myId = this.identity()

		console.log(" msg.senderId() = ", msg.senderId())
        if (myId.equals(msg.senderId())) {
			this.sent().addItemIfAbsent(msg)
		}
		
		if (myId.equals(msg.receiverId())) {
			var senderName1 = msg.senderId().name()	// test for bug
					
			this.inbox().addItemIfAbsent(msg)
			
			var senderName2 = msg.senderId().name() // test for bug
			assert (senderName1 == senderName2)  // test for bug
		}
    },
})

