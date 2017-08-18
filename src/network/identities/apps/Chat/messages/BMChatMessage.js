
BMChatMessage = BMStorableNode.extend().newSlots({
    type: "BMChatMessage",
	content: "",
	privateMessage: null,
}).setSlots({
    
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.addStoredSlots(["content", "privateMessage"])
        this.addAction("delete")
    },	

	mostRecentDate: function() {
		return 0
	},
	
	nodeRowLink: function() {
		return null
	},
	
	title: function() {
	    return this.content()
	},
})

