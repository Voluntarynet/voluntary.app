
BMChatNewThread = BMNode.extend().newSlots({
    type: "BMChatNewThread",
}).setSlots({
    
    init: function () {
        BMNode.init.apply(this)
        this.setTitle("new thread")        
    },

    localIdentity: function() {
        return this.parentNodeOfType("BMLocalIdentity")
    },

    remoteIdentities: function() {
		// TODO: change to be off of local identity
		// return this.localIdentity().remoteIdentities()
        return App.shared().remoteIdentities()
    },


    prepareToAccess: function() {
		BMNode.prepareToAccess.apply(this)
		var subnodes = this.remoteIdentities().subnodes().map((rid) => { return BMChatContact.clone().setRemoteIdentity(rid) })
        this.setSubnodes(subnodes)
    },
})

