
"use strict"

window.BMGroupChatChannel = BMApplet.extend().newSlots({
    type: "BMGroupChatChannel",
	name: "Untitled",
}).setSlots({
    init: function () {
        BMApplet.init.apply(this)
        
		this.setNotifications(BMNode.clone().setTitle("channels"))
        this.addSubnode(this.notifications())

		this.setMessages(BMNode.clone().setTitle("direct messages"))
        this.addSubnode(this.messages())

    },

	title: function() {
		return this.name()
	},
	
	setTitle: function(aString) {
		this.setName(aString)
		return this
	},	
})

