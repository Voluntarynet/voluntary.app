
BMChatContact = BMNode.extend().newSlots({
    type: "BMChatContact",
	remoteIdentity: null,
}).setSlots({
    
    init: function () {
        BMNode.init.apply(this)        
    },

	title: function() {
		return this.remoteIdentity().title()
	},

	chatApp: function() {
	 	return this.parentNodeOfType("BMChat")
	},
})
