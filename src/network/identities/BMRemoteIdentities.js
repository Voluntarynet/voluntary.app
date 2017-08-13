

BMRemoteIdentities = BMStorableNode.extend().newSlots({
    type: "BMRemoteIdentities",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setShouldStore(true)
        this.setTitle("Contacts")
        
        this.setActions(["add"]).setSubnodeProto(BMRemoteIdentity)
        this.setNoteIsSubnodeCount(true)
		//this.setShouldStoreSubnodes(false)
        //this.setPidSymbol("_remoteIdentities") 
        //this.loadIfPresent()
    },

    idWithPubkeyString: function(pubkeyString) {
        return this.subnodes().detect(function (id) {
            return id.publicKeyString().toString() == pubkeyString
        })
    },
    
    addIdWithPubkeyString: function(pubkeyString) {
        var id = BMRemoteIdentity.clone().setPublicKeyString(pubkeyString)
        this.addSubnode(id)
        return id
    },

	idWithName: function(s) {
        return this.subnodes().detect(function (id) {            
            return id.name() == s
        })
	},
})
