

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

	validSubnodes: function() {
        return this.subnodes().select(function (id) {
            return id.isValid()
        })		
	},

    idWithPublicKeyString: function(publicKeyString) { // limits to valid nodes
        return this.validSubnodes().detect(function (id) {
            return id.publicKeyString().toString() == publicKeyString
        })
    },
    
    addIdWithPublicKeyString: function(publicKeyString) {
        var id = BMRemoteIdentity.clone().setPublicKeyString(publicKeyString)
        this.addSubnode(id)
        return id
    },

	idWithName: function(s) {
        return this.subnodes().detect(function (id) {            
            return id.name() == s
        })
	},
})
