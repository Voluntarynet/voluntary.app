
window.BMSlotsNode = BMFieldSetNode.extend().newSlots({
    type: "BMSlotsNode",
    protoValue: null,
    slotName: [],
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)

 		this.setShouldStore(false)
        
		
        this.addFieldNamed("name").setValueMethod("name").setValueIsEditable(true)
        this.addStoredField(BMIdentityField.clone().setValueMethod("publicKeyString").setKey("public key").setValueIsEditable(true))
        //	this.addStoredField(BMIdentityField.clone().setValueMethod("privateKeyString").setKey("private key").setValueIsEditable(false))

        // local fields
        this.addFieldNamed("phone").setValueMethod("phone").setValueIsEditable(true)
        this.addFieldNamed("address").setValueMethod("address").setValueIsEditable(true)
        this.addFieldNamed("email").setValueMethod("email").setValueIsEditable(true)
        this.addFieldNamed("twitter").setValueMethod("twitter").setValueIsEditable(true)
        this.addFieldNamed("facebook").setValueMethod("facebook").setValueIsEditable(true)
        this.addFieldNamed("linkedin").setValueMethod("linkedin").setValueIsEditable(true)
        this.addFieldNamed("instagram").setValueMethod("instagram").setValueIsEditable(true)
        this.setNodeMinWidth(600)
    },
})