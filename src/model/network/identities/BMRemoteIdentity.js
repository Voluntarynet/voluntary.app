var bitcore = require("bitcore-lib")

BMRemoteIdentity = BMNavNode.extend().newSlots({
    type: "BMRemoteIdentity",
	name: "untitled",

	publicKeyString: "",
	privateKeyString: "",

}).setSlots({
	
    //_nodeVisibleClassName: "Contact",

    init: function () {
        BMNavNode.init.apply(this)
		this.setShouldStore(true)

        this.setNodeTitleIsEditable(true)
        this.setNodeSubtitleIsEditable(false)
        this.setNodeMinWidth(120)

        //this.addFieldNamed("name").setNodeFieldProperty("name").setValueIsEditable(true)
       // this.setName("Untitled")

		//this.addField(BMIdentityField.clone().setNodeFieldProperty("publicKeyString").setKey("public key").setValueIsEditable(true))
        //this.setPublicKeyString("")

		this.addStoredSlots(["name", "publicKeyString", "privateKeyString"])
		this.initStoredSlotWithProto("profile", BMProfile)
		this.initStoredSlotWithProto("messages", BMInbox)

        //this.setNodeBgColor("white")

		this.profile().fieldNamed("publicKeyString").setValueIsEditable(true)
		
        this.addAction("delete")
    },
    
    title: function () {
		if (this.name() == "") {
			return "untitled"
		}
        return this.name()
    },

    setTitle: function (s) {
        this.setName(s)
        return this
    },
 
    subtitle: function () {
		if (this.publicKeyString()) {
        	return this.publicKeyString().toString().slice(0, 5) + "..."
		}
		
		return ""
    },  

    isValid: function() {
		var s = this.publickKeyString()
		return bitcore.PublicKey.isValid(s)
	},
	
    publickKey: function() {
		if (this.isValid()) {
            return new bitcore.PublicKey(s)
        }
        return null
    },

	compressedPublicKeyString: function() {
		var pk = this.publickKey()
		if (pk) {
			
		}
		return null
	},

	/*
	verifySignatureOnHash: function(signature, hash) {
		
	},
	*/
    

})
