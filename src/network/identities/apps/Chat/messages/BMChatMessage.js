
BMChatMessage = BMPrivateMessage.extend().newSlots({
    type: "BMChatMessage",
	content: "",
}).setSlots({
    
    init: function () {
        BMPrivateMessage.init.apply(this)
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
		//console.log(this.typeId() + ".contentDict = ", contentDict)
		return contentDict
	},
	
	setContentDict: function(contentDict) {
		//console.log(this.typeId() + ".setContentDict = ", contentDict)
		this.setContent(contentDict.content)
		return this
	},
	
	isEqual: function(other) {
		console.log(this.description() + "' is equal? " + other.description())
		return this.hash() == other.hash()
	},
	
	description: function() {
		return this.typeId() + "-" + this.hash() + "'" + this.content() + "'"
	},
	
	hash: function() {
		if (this.objMsg()) {
			return this.objMsg().msgHash()
		}
		return this.typeId()
	},
	
	prepareToDelete: function() {
	    
	},
})

