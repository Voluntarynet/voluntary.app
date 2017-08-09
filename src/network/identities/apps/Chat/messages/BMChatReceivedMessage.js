
BMChatReceivedMessage = BMChatMessage.extend().newSlots({
    type: "BMChatReceivedMessage",
	privateMessage: null,
}).setSlots({
    
    init: function () {
        BMChatMessage.init.apply(this)
		this.setTitle("received")
    },	

})

