
BMChatThreads = BMStorableNode.extend().newSlots({
    type: "BMChatThreads",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("threads")

		setTimeout(() => { 
			this.updateIdentities()
		})
    },

	setParentNode: function(aNode) {
		BMStorableNode.setParentNode.apply(this, [aNode])
		if (aNode == null) {
			this.unwatchIdentities()
		} else {
			this.watchIdentities()
		}
	},
	
	watchIdentities: function() {
		if (!this._idsObservation) {
	        this._idsObservation = NotificationCenter.shared().newObservation().setName("didChangeIdentities").setObserver(this).watch()
		}
	},
	
	unwatchIdentities: function() {
		NotificationCenter.shared().removeObserver(this)
		this._idsObservation = null
	},
	
	didChangeIdentities: function(aNote) {
		console.log(this.nodePathString() + ".didChangeIdentities() <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
		this.updateIdentities()
	},

	chatApp: function() {
		return this.parentNode()
	},
	
	threads: function() {
		return this.subnodes()
	},

	updateIdentities: function() {
		this.removeThreadsWithNoRemoteIdentity()
		this.addThreadForEveryRemoteIdentity()
		this.sortSubnodes()
		return this		
	},
	

	chatTargetIds: function() {
	    return this.chatApp().localIdentity().allOtherIdentities()    
	},
	
	addThreadForEveryRemoteIdentity: function() {
		this.chatTargetIds().forEach((rid) => { 
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
		this.prepareToAccess()
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

