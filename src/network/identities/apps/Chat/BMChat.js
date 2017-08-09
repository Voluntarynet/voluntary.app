
BMChat = BMApplet.extend().newSlots({
    type: "BMChat",
    threads: null,
}).setSlots({
    
    init: function () {
        BMApplet.init.apply(this)

        this.setShouldStore(true)
		this.setShouldStoreSubnodes(false)
		
        this.setTitle("Chat")

		this.setThreads(BMChatThreads.clone())
		this.addSubnode(this.threads())
		this.addStoredSlot("threads")
		
		console.log(this.type() + ".init()")
		ShowStack()
    },
	
    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },

    remoteIdentities: function() {
		// TODO: change to be off of local identity
		// return this.localIdentity().remoteIdentities()
        return App.shared().remoteIdentities()
    },

	setThreads: function(newValue) {
		var oldValue = this._threads
		this._threads = newValue
		this.didUpdateSlot("threads", oldValue, newValue)
		
		if (newValue == null) {
			console.warn(this.type() + ".setThreads oldValue:", oldValue, " newValue:", newValue)
			//throw new Error("setting chat threads to null!")
			ShowStack()
		}
		return this
	},
	
})

