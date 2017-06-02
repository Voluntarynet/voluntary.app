
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
    
    handleMessage: function(twitterMessage) {
        
        
    },
})

