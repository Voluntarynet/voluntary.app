"use strict"

window.BMProfile = BMFieldSetNode.extend().newSlots({
    type: "BMProfile",
    avatars: [],
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)

 		this.setShouldStore(true)
        this.setTitle("profile")
        
		this.addStoredField(BMImageWellField.clone().setValueMethod("avatars").setKey("drop avatar image here").setMaxImageCount(1)).setValueIsEditable(true)
		
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
    

    profileImageDataUrl: function() {
        return this.avatars()[0]
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
	
	didUpdateSlot: function(slotName, oldValue, newValue) {
		BMFieldSetNode.didUpdateSlot.apply(this, [slotName, oldValue, newValue])
		if (slotName == "avatars") {
		    var parentNode = this.parentNode()
		    if (parentNode && parentNode.didUpdateSubnode) {
		        parentNode.didUpdateSubnode(this)
		    }
		}
		return this
	},
	
	shelfIconName: function() {
		return "chat/my_profile"
//	    return "user-white"
	},
})
