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
    
    name: function() {
        return this.parentNode().name()
    },
    
    setName: function(aString) {
        this.parentNode().setName(aString)
        return this
    },
    
    publicKeyString: function() {
        return this.parentNode().publicKeyString()
    },
    
    privateKeyString: function() {
        return this.parentNode().privateKeyString()
    },
})