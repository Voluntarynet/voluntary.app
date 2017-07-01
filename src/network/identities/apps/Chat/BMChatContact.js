
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

})

BMChatContactRowView = BrowserRow.extend().newSlots({
    type: "BMChatContact",
	remoteIdentity: null,
}).setSlots({
    
    init: function () {
        BrowserRow.init.apply(this)        
    },

	select: function() {
		BrowserRow.select.apply(this)
		console.log("select")
		return this
	},

})

