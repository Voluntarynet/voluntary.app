
BMGroupChat = BMApplet.extend().newSlots({
    type: "BMGroupChat",
    channels: null,
    directMessages: null,
    profile: null,
}).setSlots({
    init: function () {
        BMApplet.init.apply(this)
        this.setTitle("Slack")
        
		this.setChannels(BMNode.clone().setTitle("channels"))
        this.addItem(this.channels())

		this.setDirectMessages(BMNode.clone().setTitle("direct messages"))
        this.addItem(this.directMessages())
    },
})

