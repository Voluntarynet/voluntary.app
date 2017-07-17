
BMLocalIdentities = BMStorableNode.extend().newSlots({
    type: "BMLocalIdentities",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setShouldStore(true)
        this.setTitle("My identities")
        this.setNodeMinWidth(180)
        
        this.setActions(["add"])
        this.setSubnodeProto(BMLocalIdentity)
        this.setNoteIsSubnodeCount(true)
        
        //this.setPidSymbol("_localIdentities")  
    },

    current: function() {
        if (this.subnodesLength() == 0) {
            this.add()
        }
        
        return this.subnodes()[0]
    },
    
    idWithPubKeyString: function(s) {
        return this.subnodes().detect(function (id) {            
            return id.publicKey().toString() == s
        })
    },

	idWithName: function(s) {
        return this.subnodes().detect(function (id) {            
            return id.name() == s
        })
	}
})
