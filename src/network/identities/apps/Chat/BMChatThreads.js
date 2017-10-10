
"use strict"

window.BMChatThreads = BMContactLinks.extend().newSlots({
    type: "BMChatThreads",
}).setSlots({
    init: function () {
        BMContactLinks.init.apply(this)
        this.setLinkProto(BMChatThread)
    },

	finalize: function() {
		BMContactLinks.finalize.apply(this)
		this.setTitle("direct messages")
	},
})