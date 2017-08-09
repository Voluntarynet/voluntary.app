
BMChatSentMessage = BMChatMessage.extend().newSlots({
    type: "BMChatMessage",
	privateMessage: null,
}).setSlots({
    
    init: function () {
        BMChatMessage.init.apply(this)
		this.setTitle("sent")
    },	


})

