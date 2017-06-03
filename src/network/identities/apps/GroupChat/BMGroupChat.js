
BMGroupChat = BMApplet.extend().newSlots({
    type: "BMGroupChat",
    channels: null,
    directMessages: null,
    profile: null,
}).setSlots({
    init: function () {
        BMApplet.init.apply(this)
        this.setTitle("Slack")
        

    },
})

