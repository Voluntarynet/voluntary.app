
BMChatThread = BMStorableNode.extend().newSlots({
    type: "BMChatThread",
    remotePublicKeyString: null,
	//remoteIdentity: null,
}).setSlots({
    
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("thread")  
		this.setShouldStoreSubnodes(true)
		this.addAction("add")
		this.addStoredSlot("remotePublicKeyString")
    },

	title: function() {
		if (this.remoteIdentity()) {
			return this.remoteIdentity().title()
		}
		return this.remotePublicKeyString()
	},
	
	threads: function() {
		return this.parentNode()
	},

    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },

/*
	setRemoteIdentity: function(rid) {
		this._remoteIdentity = rid
		this.setRemotePublicKeyString(rid.publicKeyString())
		console.warn("]]]]]]] " + this.typeId() + " setRemoteIdentity(" + rid.typeId() + ") this.receiverPublicKeyString() = ", this.remotePublicKeyString())
		this.markDirty()
		return this
	},
	*/
	
	assertHasRid: function() {
	    assert(this.remoteIdentity())
	},
	
	remoteIdentity: function() {
	    assert(this.remotePublicKeyString())
		console.warn("]]]]]]] " + this.typeId() + " sremoteIdentity() this.remotePublicKeyString() = ", this.remotePublicKeyString())
		return this.localIdentity().remoteIdentities().idWithPubKeyString(this.remotePublicKeyString())
	},
	
	mostRecentDate: function() {
		return 0
	},
	
	messages: function() {
		return this.subnodes()
	},
	
    add: function() {
        var newComposeMsg = BMChatComposeMessage.clone()
		//newComposeMsg.setSenderPublicKeyString(this.localIdentity().publicKeyString())
		this.addSubnode(newComposeMsg)
        //this.didUpdateNode()
        //this.markDirty()
        return newComposeMsg
    },

	/*
	didStore: function() {
		//console.log(this.typeId() + ".didStore()")
	},
	*/
})

