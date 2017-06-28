
BMChatNewThread = BMNode.extend().newSlots({
    type: "BMChatNewThread",
}).setSlots({
    
    init: function () {
        BMNode.init.apply(this)
        this.setTitle("new thread")        
    },

    prepareToAccess: function() {
        this.setItems(
    },
})

