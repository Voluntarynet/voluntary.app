
"use strict"

window.BMChatThreads = BMContactLinks.extend().newSlots({
    type: "BMChatThreads",
}).setSlots({
    init: function () {
        BMContactLinks.init.apply(this)
        this.setLinkProto(BMChatThread)
    },
})