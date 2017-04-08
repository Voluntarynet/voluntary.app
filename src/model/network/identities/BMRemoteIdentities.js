BMRemoteIdentities = BMListNode.extend().newSlots({
    type: "BMRemoteIdentities",
}).setSlots({
    init: function () {
        BMListNode.init.apply(this)
		this.setShouldStore(true)
        this.setTitle("Contacts")
        this.setNodeMinWidth(180)
        
        this.setActions(["add"]).setSubnodeProto(BMRemoteIdentity)
        this.setNoteIsItemCount(true)
        
        //this.setPidSymbol("_remoteIdentities") 
        //this.loadIfPresent()
    },

    idWithPubKeyString: function(pubkeyString) {
        var id = this.items().detect(function (id) {
            return id.publicKey().toString() == pubkeyString
        })
        
        if (!id) {
            // make an id if it's not here
            id = BMRemoteIdentity.clone().setPublickKeyString(pubkeyString)
            this.addItem(id)
        }
        
        return id
    },
})
