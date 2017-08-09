
BMChatComposeMessage = BMChatMessage.extend().newSlots({
    type: "BMChatComposeMessage",
	content: null,
}).setSlots({
    
    init: function () {
        BMChatMessage.init.apply(this)
		this.setTitle("compose")
    },	

})

