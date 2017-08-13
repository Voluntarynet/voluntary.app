
BMChatMessage = BMStorableNode.extend().newSlots({
    type: "BMChatMessage",
}).setSlots({
    
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.addAction("delete")
    },	

	/*
	title: function() {
		if (this.remoteIdentity()) {
			return this.remoteIdentity().title()
		}
		
		return "content"
	},
	
	senderId: function() {
		return null
	},
	
	subtitle: function() {
		if (this.senderId()) {
			return this.senderId().title()
		}
		
		return "sender"
	},

	setRemoteIdentity: function(rid) {
		this._remoteIdentity = rid
		this.setRemotePublicKeyString(rid.publicKeyString())
		return this
	},
	
	remoteIdentity: function() {
		if (this._remoteIdentity == null) {
			this._remoteIdentity = this.localIdentity().remoteIdentityWithPublicKeyString(this.receiverPublicKeyString())
		}
		return this._remoteIdentity
	},
	*/
	
	mostRecentDate: function() {
		return 0
	},
	
	/*
	didStore: function() {
		console.warn(this.typeId() + ".didStore()")
	},
	*/
})

