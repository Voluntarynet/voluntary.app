
BMChatThreads = BMStorableNode.extend().newSlots({
    type: "BMChatThreads",
}).setSlots({
    
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("threads")        
    },

	openThreadForRemoteIdentity: function(rid) {
		var thread = this.threadForRemoteIdentity(rid)
		
		if (!thread) {
			thread = BMChatThread.clone().setRemoteIdentity(rid)
		}
		
		this.addSubnode(thread)
		return this
	},
	
	threadForRemoteIdentity: function(rid) {
		return this.subnodes().detect((thread) => {
			return thread.remoteIdentity() == rid
		})
	},
})

