
BMChatMessage = BMPrivateMessage.extend().newSlots({
    type: "BMChatMessage",
}).setSlots({
    init: function () {
        BMPrivateMessage.init.apply(this)
    },


    place: function() {
        
    },
})

