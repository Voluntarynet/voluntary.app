
BMGroupChatRoom = BMApplet.extend().newSlots({
    type: "BMGroupChatRoom",
		name: "Untitled",
	}).setSlots({
	    init: function () {
	        BMApplet.init.apply(this)

			this.setNotifications(BMNode.clone().setTitle("channels"))
	        this.addItem(this.notifications())

			this.setMessages(BMNode.clone().setTitle("direct messages"))
	        this.addItem(this.messages())

	    },

		title: function() {
			return this.name()
		},

		setTitle: function(aString) {
			this.setName(aString)
			return this
		},
})

