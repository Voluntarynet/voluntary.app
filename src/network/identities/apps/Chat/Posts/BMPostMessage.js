
"use strict"

window.BMPostMessage = BMAppMessage.extend().newSlots({
    type: "BMPostMessage",
	content: "",
}).setSlots({
    
    init: function () {
        BMAppMessage.init.apply(this)
        this.addStoredSlots(["content"])
        this.addAction("delete")
        this.setShouldStore(true)	
		this.setContent("...".loremIpsum(40, 100))	
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
	
	description: function() {
		return this.typeId() + "-" + this.hash() + "'" + this.content() + "'"
	},

    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },
    
	localIdentityIsSender: function() {
		return this.senderId().equals(this.localIdentity())
	},
	
	avatarImageDataURL: function() {
		return this.localIdentity().profile().profileImageDataUrl()
	},
})

