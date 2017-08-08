
BMChatThread = BMStorableNode.extend().newSlots({
    type: "BMChatThread",
    remotePublicKeyString: null,
}).setSlots({
    
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setTitle("threads")  
    },

	setRemoteIdentity: function(rid) {
		this.setRemotePublicKeyString(rid.publicKeyString())
		return this
	},
	
	remoteIdentity: function() {
		if (this._remoteIdentity == null) {
			this._remoteIdentity = this.localIdentity().remoteIdentityWithPublicKeyString(this.receiverPublicKeyString())
		}
		return this._remoteIdentity
	},
})

