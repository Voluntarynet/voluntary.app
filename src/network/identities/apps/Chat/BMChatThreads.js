
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
		this.removeThreadsWithNoRemoteIdentity()
		this.addThreadForEveryRemoteIdentity()
		this.sortSubnodes()
	},
	
	addThreadForEveryRemoteIdentity: function() {
		this.chatApp().remoteIdentities().subnodes().forEach((rid) => { 
			if (!this.threadForRemoteIdentity(rid)) {
				var thread = BMChatThread.clone().setRemoteIdentity(rid)
				this.addSubnode(thread)
			}
		})
		return this		
	},
	
	removeThreadsWithNoRemoteIdentity: function() {
		var ridSubnodes = this.subnodes().select((thread) => { 
			return thread.remoteIdentity() != null
		})
		this.setSubnodes(ridSubnodes)
		return this
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
	
	didStore: function() {
		//console.log(this.typeId() + ".didStore()")
	},

})

