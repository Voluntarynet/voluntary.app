var bitcore = require("bitcore-lib")

BMRemoteIdentity = BMNavNode.extend().newSlots({
    type: "BMRemoteIdentity",
	name: "untitled",
	publicKeyString: "",
}).setSlots({
	
    _nodeVisibleClassName: "Contact",

    init: function () {
        BMNavNode.init.apply(this)
		this.setShouldStore(true)

        this.setNodeTitleIsEditable(true)
        this.setNodeSubtitleIsEditable(false)
        this.setNodeMinWidth(120)

        //this.addFieldNamed("name").setNodeFieldProperty("name").setValueIsEditable(true)
       // this.setName("Untitled")

		//this.addStoredField(BMIdentityField.clone().setNodeFieldProperty("publicKeyString").setKey("public key").setValueIsEditable(true))
        //this.setPublicKeyString("")

		this.addStoredSlots(["name", "publicKeyString"])
		this.initStoredSlotWithProto("profile", BMProfile)
		this.initStoredSlotWithProto("messages", BMInbox)
		this.messages().setTitle("messages")

        //this.setNodeBgColor("white")

		this.profile().fieldNamed("publicKeyString").setValueIsEditable(true)
		
        this.addAction("delete")
    },

	didLoadFromStore: function() {
		BMNavNode.didLoadFromStore.apply(this)
		this.messages().setTitle("messages")
	},
    
    title: function () {
		if (this.name() == "") {
			return "Untitled"
		}
        return this.name()
    },

    setTitle: function (s) {
        this.setName(s)
        return this
    },
 /*
    subtitle: function () {
		if (this.publicKeyString()) {
        	return this.publicKeyString().toString().slice(0, 5) + "..."
		}
		
		return ""
    },  
*/

    isValid: function() {
		var s = this.publicKeyString()
		return bitcore.PublicKey.isValid(s)
	},
	
    publicKey: function() {
		if (this.isValid()) {
			var s = this.publicKeyString()
            return new bitcore.PublicKey(s)
        }
        return null
    },

    verifySignatureForMessage: function(signature, msgString) {
        var address = this.publicKey().toAddress()
        var verified = Message(msgString).verify(address, signature);
        return verified
    },

	handleMessage: function(aPrivateMsg) {
		/*
		if (aPrivateMsg.senderId() == this || aPrivateMsg.receiverId() == this) {
			this.messages().addSubnodeIfAbsent(aPrivateMsg)
		}
		*/	
		
		return this
	},

})
