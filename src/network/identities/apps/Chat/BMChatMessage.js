
"use strict"

window.BMChatMessage = BMAppMessage.extend().newSlots({
    type: "BMChatMessage",
	content: "",
}).setSlots({
    
    init: function () {
        BMAppMessage.init.apply(this)
        this.addStoredSlots(["content"])
        //this.addAction("delete")
    },	

	mostRecentDate: function() {
		return 0
	},
	
	nodeRowLink: function() {
		return null
	},
	
	title: function() {
	    return this.content()
	},
	
	wasSentByMe: function() {
		return this.senderId() === this.localIdentity()
	},
	
	contentDict: function() {
		var contentDict = {}
		contentDict.content = this.content()
		return contentDict
	},
	
	setContentDict: function(contentDict) {
		this.setContent(contentDict.content)
		//this.scheduleSyncToView()
		return this
	},
	
	isEqual: function(other) {
		return this.hash() == other.hash()
	},
	
	description: function() {
		return this.typeId() + "-" + this.hash() + "'" + this.content() + "'"
	},

	prepareToDelete: function() {
	    // TODO: mark MsgObjRecord as deleted
	},
	
    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },
    
	localIdentityIsSender: function() {
		return this.senderId().equals(this.localIdentity())
	},
})

