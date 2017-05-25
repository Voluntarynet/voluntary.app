BMProfile = BMFieldSetNode.extend().newSlots({
    type: "BMProfile",
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)

 		this.setShouldStore(true)
        this.setTitle("profile")
        
		// pass through fields
        this.addFieldNamed("name").setNodeFieldProperty("name").setValueIsEditable(true)
		this.addField(BMIdentityField.clone().setNodeFieldProperty("publicKeyString").setKey("public key").setValueIsEditable(true))
	//	this.addField(BMIdentityField.clone().setNodeFieldProperty("privateKeyString").setKey("private key").setValueIsEditable(false))

		// local fields
        this.addFieldNamed("phone").setNodeFieldProperty("phone").setValueIsEditable(true)
        this.addFieldNamed("email").setNodeFieldProperty("email").setValueIsEditable(true)
        this.addFieldNamed("address").setNodeFieldProperty("address").setValueIsEditable(true)

        this.setNodeBgColor("white")
    },

	setParentNode: function(aNode) {
		BMFieldSetNode.setParentNode.apply(this, [aNode])
		
		// pass through fields
		this.fieldNamed("name").setTarget(aNode)
		this.fieldNamed("publicKeyString").setTarget(aNode)
		//this.fieldNamed("privateKeyString").setTarget(aNode)
		return this
	},

	identity: function() {
		return this.parentNode()
	},
})