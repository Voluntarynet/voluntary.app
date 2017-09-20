
"use strict"

window.BMChatThread = BMStorableNode.extend().newSlots({
    type: "BMChatThread",
	remoteIdentity: null,
}).setSlots({
    
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("thread")  
		this.setShouldStoreSubnodes(true)
		//this.addAction("add")
		this.addAction("deleteAll")
		this.addStoredSlot("remoteIdentity")
        this.setNodeMinWidth(600)
        this.setNodeHasFooter(true)
        this.setNodeInputFieldMethod("setInputFieldValue")
		this.createSubnodeIndex()
    },

	title: function() {
		if (this.remoteIdentity()) {
			return this.remoteIdentity().title()
		}
		return "[missing rid]"
	},
	
	nodeHeaderTitle: function() {
		return "Chat with " + this.title()
	},
	
	setInputFieldValue: function(s) {
		var msg = BMChatMessage.clone()

		msg.setContent(s)
		msg.sendToRemoteId(this.remoteIdentity())
		
		this.addMessage(msg)
		
	    return this
	},
	
	deleteAll: function() {
	    this.messages().forEach((chatMsg) => {
	        chatMsg.prepareToDelete()
	    })
	    this.removeAllSubnodes()
	    return this
	},
	
	threads: function() {
		return this.parentNode()
	},

    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity") // this won't work before it's added as a subnode
    },
	
	assertHasRid: function() {
	    assert(this.remoteIdentity())
	},
	
	hasValidRemoteIdentity: function() {
	    var result = this.threads().chatTargetIds().detect((id) => { return id === this.remoteIdentity() })
	    //var result = this.localIdentity().remoteIdentities().idWithPublicKeyString(this.remoteIdentity().publicKeyString()) 
	    //console.log(this.typeId() + " " + this.remoteIdentity().title() + ".hasValidRemoteIdentity() = " + result)
	    return result != null
	},
	
	mostRecentDate: function() {
		return 0
	},
	
	messages: function() {
		return this.subnodes()
	},
	
	addMessage: function(msg) {	
		console.log(this.nodePathString() + " addMessage " + msg.typeId())
	    if(this.addSubnodeIfAbsent(msg)) {
	    	this.postShouldFocusSubnode(msg)
		}
	    return this
	},
})
