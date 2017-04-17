BMProfile = BMFieldSetNode.extend().newSlots({
    type: "BMProfile",
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
 		this.setShouldStore(true)
		this.setShouldStoreItems(false)
        this.setTitle("Profile")
        
        this.addFieldNamed("name").setNodeFieldProperty("name").setValueIsEditable(true)
        this.addFieldNamed("public key").setNodeFieldProperty("publicKeyString").setValueIsEditable(false)
        this.addFieldNamed("private key").setNodeFieldProperty("privateKeyString").setValueIsEditable(false)

        this.setNodeBgColor("white")
       // this.setViewClassName("BMFieldSetView")
    },

	setParentNode: function(aNode) {
		BMFieldSetNode.setParentNode.apply(this, [aNode])
		this.fieldNamed("name").setTarget(aNode)
		return this
	},

	identity: function() {
		return this.parentNode()
	},
    
    publicKeyString: function() {
        return this.identity().publicKeyString()
    },
    
    privateKeyString: function() {
        return this.identity().privateKeyString()
    },
})