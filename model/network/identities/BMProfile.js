BMProfile = BMFormNode.extend().newSlots({
    type: "BMProfile",
}).setSlots({
    init: function () {
        BMFormNode.init.apply(this)
        this.setTitle("Profile")
        
        this.addFieldNamed("name").setNodeTitleIsEditable(false).setNodeFieldProperty("name")
        this.addFieldNamed("public key").setNodeTitleIsEditable(false).setNodeFieldProperty("publicKeyString")
        this.addFieldNamed("private key").setNodeTitleIsEditable(false).setNodeFieldProperty("privateKeyString")
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