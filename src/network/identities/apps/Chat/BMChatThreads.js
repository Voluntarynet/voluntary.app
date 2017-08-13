
BMChatThreads = BMStorableNode.extend().newSlots({
    type: "BMChatThreads",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("threads")

		// TODO: watch contacts and update as needed?
    },

	chatApp: function() {
		return this.parentNode()
	},
	
	threads: function() {
		return this.subnodes()
	},

	prepareToAccess: function() {
		console.log("++++++ " + this.typeId() + " prepareToAccess")
		BMNode.prepareToAccess.apply(this)	

		this.removeThreadsWithNoRemoteIdentity()
		this.addThreadForEveryRemoteIdentity()
		this.sortSubnodes()
	},
	
	addThreadForEveryRemoteIdentity: function() {
		this.chatApp().remoteIdentities().validSubnodes().forEach((rid) => { 
			if (!this.threadForRemoteIdentity(rid)) {
				var thread = BMChatThread.clone().setRemoteIdentity(rid)
			   	console.log(this.typeId() + " adding thread ", thread.title())
				this.addSubnode(thread)
			}
		})
		return this		
	},

	removeThreadsWithNoRemoteIdentity: function() {
		this.threads().slice().forEach((thread) => {
			if (!thread.hasValidRemoteIdentity()) {
				console.log(this.typeId() + " removing invalid thread ", thread.title())
				this.removeSubnode(thread)
			}
		})
		
		return this
	},
	
	threadForRemoteIdentity: function(rid) {
		return this.threads().detect((thread) => {
			return thread.remoteIdentity() === rid
		})
	},
	
	sortSubnodes: function() {
		var threads = this.threads().slice()

		threads.sort((threadA, threadB) => {
			return threadA.title().localeCompare(threadB.title())
		})
		
		threads.sort((threadA, threadB) => {
			return threadA.mostRecentDate() - threadB.mostRecentDate() 
		})
		
		if (!threads.equals(this.threads())) {
			this.setSubnodes(threads)
		}

		return this
	},
	
	/*
	markDirty: function() {
		console.trace(this.typeId() + ".markDirty()")
		BMStorableNode.markDirty.apply(this)
	},
	*/
	
	/*
	didStore: function() {
		console.log(this.typeId() + ".didStore()")
	},
	*/

})

