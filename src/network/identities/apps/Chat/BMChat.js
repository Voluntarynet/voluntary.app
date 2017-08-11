
BMChat = BMApplet.extend().newSlots({
    type: "BMChat",
    threads: null,
}).setSlots({
    
    init: function () {
        BMApplet.init.apply(this)

        this.setShouldStore(true)
		this.setShouldStoreSubnodes(false)
		
        this.setTitle("Chat")

		this.addStoredSlot("threads")
		this.setThreads(BMChatThreads.clone())
		this.addSubnode(this.threads())
		
		//console.log(">>>>>>> " + this.typeId() + ".init()")
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
			console.warn(this.typeId() + ".setThreads oldValue:", oldValue, " newValue:", newValue)
			//debugger;
			//throw new Error("setting chat threads to null!")
			//ShowStack()
		}
		return this
	},
	
	/*
	willStore: function(aDict) {
		if (this.threads() == null) {
			console.warn(this.pid() + " missing threads!?")
		}
		console.log(this.pid() + ".willStore(" + JSON.stringify(aDict) + ")")
	},
	
	didStore: function(aDict) {
		console.log(this.pid() + ".didStore(" + JSON.stringify(aDict)  + ")")
	},
	*/
})

