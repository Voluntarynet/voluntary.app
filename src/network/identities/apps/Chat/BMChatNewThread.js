
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
        return App.shared().remoteIdentities()
    },

    prepareToAccess: function() {
		BMNode.prepareToAccess.apply(this)
        console.log(this.type() + ".prepareToAccess()")
		var subnodes = this.remoteIdentities().subnodes().map((rid) => { return BMChatContact.clone().setRemoteIdentity(rid) })
		console.log("subnodes = ", subnodes)
        this.setSubnodes(subnodes)
        //this.setNeedsSyncToView(true)
    },
})

