

BMRemoteIdentities = BMListNode.extend().newSlots({
    type: "BMRemoteIdentities",
}).setSlots({
    init: function () {
        BMListNode.init.apply(this)
		this.setShouldStore(true)
        this.setTitle("Contacts")
        this.setNodeMinWidth(180)
        
        this.setActions(["add"]).setSubnodeProto(BMRemoteIdentity)
        this.setNoteIsSubnodeCount(true)
        
        //this.setPidSymbol("_remoteIdentities") 
        //this.loadIfPresent()
    },

    idWithPubKeyString: function(pubkeyString) {
        var id = this.subnodes().detect(function (id) {
            return id.publicKey().toString() == pubkeyString
        })
        
        if (!id) {
            // make an id if it's not here
            id = BMRemoteIdentity.clone().setPublicKeyString(pubkeyString)
            this.addSubnode(id)
        }
        
        return id
    },

	idWithName: function(s) {
        return this.subnodes().detect(function (id) {            
            return id.name() == s
        })
	},
})
