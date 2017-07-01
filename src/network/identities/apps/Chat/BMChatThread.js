
BMChatThread = BMStorableNode.extend().newSlots({
    type: "BMChatThread",
    receiverPublicKeyString: null,
}).setSlots({
    
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("threads")  
    },
})

