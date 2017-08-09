
BMChatThreads = BMStorableNode.extend().newSlots({
    type: "BMChatThreads",
}).setSlots({
    
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("threads")        
    },

	chatApp: function() {
		return this.parentNode()
	},

	prepareToAccess: function() {
		BMNode.prepareToAccess.apply(this)

		// remove threads for which there is no remote identity
		
		var newSubnodes = this.subnodes().select((thread) => { 
			return thread.remoteIdentity() != null
		})
		
		this.setSubnodes(newSubnodes)
		
		// make sure we have a thread for each remote identities
		
		this.chatApp().remoteIdentities().subnodes().forEach((rid) => { 
			
			// add a thread if there isn't one
			if (!this.threadForRemoteIdentity(rid)) {
				var thread = BMChatThread.clone().setRemoteIdentity(rid)
				this.addSubnode(thread)
			}
			
		})
			
		this.sortSubnodes()
	},
	
	threadForRemoteIdentity: function(rid) {
		return this.subnodes().detect((thread) => {
			return thread.remoteIdentity() == rid
		})
	},
	
	sortSubnodes: function() {
		var threads = this.subnodes().slice()

		threads.sort((threadA, threadB) => {
			return threadA.title().localeCompare(threadB.title())
		})
		
		threads.sort((threadA, threadB) => {
			return threadA.mostRecentDate() - threadB.mostRecentDate() 
		})
		
		this.setSubnodes(threads)
		return this
	},

})

