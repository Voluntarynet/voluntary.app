
BMLocalIdentities = BMStorableNode.extend().newSlots({
    type: "BMLocalIdentities",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setShouldStore(true)
        this.setTitle("My identities")
        
        this.setActions(["add"])
        this.setSubnodeProto(BMLocalIdentity)
        this.setNoteIsSubnodeCount(true)
        
        //this.setPidSymbol("_localIdentities")  
		this._didChangeIdentitiesNote = NotificationCenter.shared().newNotification().setSender(this.uniqueId()).setName("didChangeIdentities")
    },

    current: function() {
        if (this.subnodesLength() == 0) {
            this.add()
        }
        
        return this.subnodes()[0]
    },
    
    idWithPublicKeyString: function(s) {
        return this.subnodes().detect(function (id) {            
            return id.publicKey().toString() == s
        })
    },

	idWithName: function(s) {
        return this.subnodes().detect(function (id) {            
            return id.name() == s
        })
	},
	
    didChangeSubnodeList: function() {
		//console.log(this.typeId() + " didChangeSubnodeList <<<")
		BMStorableNode.didChangeSubnodeList.apply(this)
        this._didChangeIdentitiesNote.post()
        return this
    },
})
