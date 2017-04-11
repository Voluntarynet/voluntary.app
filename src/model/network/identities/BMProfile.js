BMProfile = BMFormNode.extend().newSlots({
    type: "BMProfile",
}).setSlots({
    init: function () {
        BMFormNode.init.apply(this)
 		this.setShouldStore(true)
        this.setTitle("Profile")
        
        this.addFieldNamed("name").setNodeTitleIsEditable(true).setNodeFieldProperty("name")
        this.addFieldNamed("public key").setNodeTitleIsEditable(false).setNodeFieldProperty("publicKeyString")
        this.addFieldNamed("private key").setNodeTitleIsEditable(false).setNodeFieldProperty("privateKeyString")

        this.setNodeBgColor("white")
    },
    
    name: function() {
        return this.parentNode().parentNode().name()
    },
    
    setName: function(aString) {
        this.parentNode().parentNode().setName(aString)
        return this
    },
    
    publicKeyString: function() {
        return this.parentNode().publicKeyString()
    },
    
    privateKeyString: function() {
        return this.parentNode().privateKeyString()
    },
})