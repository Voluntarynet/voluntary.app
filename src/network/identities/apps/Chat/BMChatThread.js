
BMChatThread = BMStorableNode.extend().newSlots({
    type: "BMChatThread",
	remoteIdentity: null,
}).setSlots({
    
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("thread")  
		this.setShouldStoreSubnodes(true)
		this.addAction("add")
		this.addStoredSlot("remoteIdentity")
        this.setNodeMinWidth(600)
    },

	title: function() {
		if (this.remoteIdentity()) {
			return this.remoteIdentity().title()
		}
		return "[missing rid]"
	},
	
	subtitle: function() {
		if (this.remoteIdentity()) {
			return this.remoteIdentity().pid().split("_").pop()
		}
		return "[missing rid]"	    
	    
	},
	
	threads: function() {
		return this.parentNode()
	},

    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity") // this won't work before it's added as a subnode
    },
	
	assertHasRid: function() {
	    assert(this.remoteIdentity())
	},
	
	hasValidRemoteIdentity: function() {
	    var result = this.localIdentity().remoteIdentities().idWithPubkeyString(this.remoteIdentity().publicKeyString()) 
	    console.log(this.typeId() + " " + this.remoteIdentity().title() + ".hasValidRemoteIdentity() = " + result)
	    return result != null
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

