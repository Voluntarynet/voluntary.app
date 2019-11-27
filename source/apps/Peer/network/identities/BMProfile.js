"use strict"

/*

    BMProfile
    
*/

window.BMProfile = class BMProfile extends BMFieldSetNode {
    
    initPrototype () {
        this.newSlots({
            avatars: [],
        })
    }

    init () {
        super.init()

 		this.setShouldStore(true)
        this.setTitle("profile")
        
        this.addStoredField(BMImageWellField.clone().setValueMethod("avatars").setKey("avatar image")).setValueIsEditable(true)
		
        this.addFieldNamed("name").setValueMethod("name").setValueIsEditable(true)
        this.addStoredField(BMIdentityField.clone().setValueMethod("publicKeyString").setKey("public key").setValueIsEditable(true))
        //	this.addStoredField(BMIdentityField.clone().setValueMethod("privateKeyString").setKey("private key").setValueIsEditable(false))

        // local fields
        this.addFieldNamed("phone").setValueMethod("phone").setValueIsEditable(true)
        this.addFieldNamed("email").setValueMethod("email").setValueIsEditable(true)
        /*
        this.addFieldNamed("address").setValueMethod("address").setValueIsEditable(true)
        this.addFieldNamed("twitter").setValueMethod("twitter").setValueIsEditable(true)
        this.addFieldNamed("facebook").setValueMethod("facebook").setValueIsEditable(true)
        this.addFieldNamed("linkedin").setValueMethod("linkedin").setValueIsEditable(true)
        this.addFieldNamed("instagram").setValueMethod("instagram").setValueIsEditable(true)
        */
        this.setNodeMinWidth(600)
    }

    profileImageDataUrl () {
        return this.avatars()[0]
    }
    
    setParentNode (aNode) {
        super.setParentNode(aNode)
		
        // pass through fields
        this.fieldNamed("name").setTarget(aNode)
        this.fieldNamed("publicKeyString").setTarget(aNode)
        //this.fieldNamed("privateKeyString").setTarget(aNode)
        return this
    }

    identity () {
        return this.parentNode()
    }
	
    didUpdateSlot (slotName, oldValue, newValue) {
        super.didUpdateSlot(slotName, oldValue, newValue)

        if (slotName === "avatars") {
		    const parentNode = this.parentNode()
		    if (parentNode && parentNode.didUpdateSubnode) {
		        parentNode.didUpdateSubnode(this)
		    }
        }
        return this
    }
	
    shelfIconName () {
        return "chat/my_profile"
        //	    return "user-white"
    }
    
}.initThisClass()
