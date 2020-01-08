
"use strict"

/*

    BMMail

*/

window.BMMail = class BMMail extends BMApplet {
    
    initPrototype () {
        this.newSlot("feed", null)
        this.newSlot("drafts", null)
        this.newSlot("notifications", null)
        this.newSlot("messages", null)
        this.newSlot("profile", null)
        this.newSlot("following", null)
        this.newSlot("followers", null)
    }

    init () {
        super.init()
        this.setTitle("Mail")

        this.initStoredSubnodeSlotWithProto("drafts", BMDrafts)
        this.initStoredSubnodeSlotWithProto("inbox", BMInbox)
        this.initStoredSubnodeSlotWithProto("sent", BMSent)        
    }
	
    localIdentity () {
        return this.parentNodeOfType("BMLocalIdentity")
    }
    
    handleMessage (msg) {
        if (msg.type() === BMMailMessage.type()) {
            this.handleSentMessage(msg)
            this.handleReceivedMessage(msg)
        }
    }

    handleSentMessage (msg) {
        if (this.localIdentity().equals(msg.senderId())) {
            this.sent().addSubnodeIfAbsent(msg)
        }		
    }
	
    handleReceivedMessage (msg) {
        if (this.localIdentity().equals(msg.receiverId())) {
            this.inbox().addSubnodeIfAbsent(msg)
        }		
    }
    
}.initThisClass()

