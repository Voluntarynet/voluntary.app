
BMChatThreads = BMStorableNode.extend().newSlots({
    type: "BMChatThreads",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("threads")

		setTimeout(() => { 
			// so this happens after load from store
		    if (this.parentNode()) {
			    this.updateIdentities()
		    }
		}, 0)
    },

	didLoadFromStore: function() {
		BMStorableNode.didLoadFromStore.apply(this)
		console.log(this.typeId() + " didLoadFromStore")
	},

	setParentNode: function(aNode) {
		BMStorableNode.setParentNode.apply(this, [aNode])
		if (aNode == null) {
			this.unwatchIdentities()
		} else {
			this.watchIdentities()
		}
	},
	
	finalizeJustLoadedObjects: function() {
		this.updateIdentities()
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
		//console.log(this.nodePathString() + ".didChangeIdentities() <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
		setTimeout(() => {
		this.updateIdentities()
		}, 10)
	},

	chatApp: function() {
		return this.parentNode()
	},
	
	localIdentity: function() {
		return this.chatApp().localIdentity()
	},
	
	threads: function() {
		return this.subnodes()
	},

	updateIdentities: function() {
		this.removeThreadsWithNoRemoteIdentity()
		this.addThreadForEveryRemoteIdentity()
		this.sortSubnodes()
		//console.log(this.typeId() + " updateIdentities threads " + this.subnodes().length)
		return this		
	},

	chatTargetIds: function() {
	    //return this.chatApp().localIdentity().allOtherIdentities()   	     
	    var chatTargetIds  = this.localIdentity().remoteIdentities().validSubnodes()
/*
		if (this.localIdentity().name() == "Steve") {
			console.warn("lid ", this.localIdentity().name())
			console.log("	remoteIdentities.length: ", this.localIdentity().remoteIdentities().subnodes().length )
			console.log("	remoteIdentities: ", this.localIdentity().remoteIdentities().names() )
			console.log("	chatTargetIds: ", chatTargetIds.map((rid) => { return rid.name() }) )
		}
		*/
		return chatTargetIds	
	},
	
	addThreadForEveryRemoteIdentity: function() {
		this.chatTargetIds().forEach((rid) => { 
			if (!this.threadForRemoteIdentity(rid)) {
				var thread = BMChatThread.clone().setRemoteIdentity(rid)
			   	console.log(this.typeId() + " adding thread ", thread.title())
				this.addSubnode(thread)
			} else {
			   //	console.log(this.typeId() + " already has thread for rid ", rid.name())
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
})