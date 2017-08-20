BMProfile = BMFieldSetNode.extend().newSlots({
    type: "BMProfile",
    avatars: [],
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)

 		this.setShouldStore(true)
        this.setTitle("profile")
        
		this.addStoredField(BMImageWellField.clone().setValueMethod("avatars")).setValueIsEditable(true)
		
        this.addFieldNamed("name").setValueMethod("name").setValueIsEditable(true)
		this.addStoredField(BMIdentityField.clone().setValueMethod("publicKeyString").setKey("public key").setValueIsEditable(true))
	//	this.addStoredField(BMIdentityField.clone().setValueMethod("privateKeyString").setKey("private key").setValueIsEditable(false))

		// local fields
        this.addFieldNamed("phone").setValueMethod("phone").setValueIsEditable(true)
        this.addFieldNamed("email").setValueMethod("email").setValueIsEditable(true)
        this.addFieldNamed("address").setValueMethod("address").setValueIsEditable(true)
		this.setNodeMinWidth(600)
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