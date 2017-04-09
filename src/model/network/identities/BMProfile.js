BMProfile = BMFormNode.extend().newSlots({
    type: "BMProfile",
}).setSlots({
    init: function () {
        BMFormNode.init.apply(this)
 		this.setShouldStore(true)
        this.setTitle("Profile")
        
        this.addFieldNamed("name").setNodeTitleIsEditable(true).setNodeFieldProperty("name")
        this.addFieldNamed("public key").setNodeTitleIsEditable(true).setNodeFieldProperty("publicKeyString")
        this.addFieldNamed("private key").setNodeTitleIsEditable(true).setNodeFieldProperty("privateKeyString")
    },
    
    name: function() {
        return this.parentNode().name()
    },
    
    publicKeyString: function() {
        return this.parentNode().publicKeyString()
    },
    
    privateKeyString: function() {
        return this.parentNode().privateKeyString()
    },
})