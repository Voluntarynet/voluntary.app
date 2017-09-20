var bitcore = require("bitcore-lib")

BMRemoteIdentity = BMNavNode.extend().newSlots({
    type: "BMRemoteIdentity",
	name: "untitled",
	publicKeyString: "",
	hasPrivateKey: false,
	sessionKeys: null,
}).setSlots({
	
    _nodeVisibleClassName: "Contact",

    init: function () {
        BMNavNode.init.apply(this)
		this.setShouldStore(true)

        this.setNodeTitleIsEditable(true)
        this.setNodeSubtitleIsEditable(false)

		this.addStoredSlots(["name", "publicKeyString"])
		
		this.initStoredSubnodeSlotWithProto("profile", BMProfile)
		this.initStoredSubnodeSlotWithProto("messages", BMInbox)
		//this.initStoredSubnodeSlotWithProto("sessionKeys", BMSessionKeys)
		
		this.messages().setTitle("messages")

        //this.setNodeBackgroundColor("white")

		this.profile().fieldNamed("publicKeyString").setValueIsEditable(true)
		
        this.addAction("delete")
		this._didChangeIdentityNote = NotificationCenter.shared().newNotification().setSender(this.uniqueId()).setName("didChangeIdentity").setInfo(this)
    },
    
	postChange: function() {
        this._didChangeIdentityNote.post()
		return this
	},
	
    localIdentity: function() {
		/*
		var localIdentity = this.parentNode().parentNode()
		assert(localIdentity.type() == "BMLocalIdentity")
		return localIdentity
		*/
        return this.parentNodeOfType("BMLocalIdentity")
    },
    
    didUpdateSlot: function(slotName, oldValue, newValue) {
        BMNavNode.didUpdateSlot.apply(this, [slotName, oldValue, newValue])
        
        if (slotName == "publicKeyString") {
            this.postChange()
        }
        
        return this
    },

	didLoadFromStore: function() {
		BMNavNode.didLoadFromStore.apply(this)
		this.messages().setTitle("messages")
		//console.log(this.typeId() + " didLoadFromStore")
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

	subtitle: function() {
		if (!this.isValid()) {
			return "need to set public key"
		}
		return null
	},

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

	handleObjMsg: function(objMsg) {

		var dict = this.decryptJson(objMsg.encryptedData())
		if (dict) {
			var appMsg = BMAppMessage.fromDataDict(dict)
			//console.log("created ", appMsg.typeId())
			
			if (appMsg) {
				appMsg.setSenderId(this)
				appMsg.setReceiverId(this.localIdentity())
				appMsg.setObjMsg(objMsg)
				this.localIdentity().handleAppMsg(appMsg)
				return true
			}
		}
		return false
	},
	
	equals: function(anIdentity) {
		return anIdentity != null && anIdentity.publicKeyString && (this.publicKeyString() == anIdentity.publicKeyString())
	},
	
	encryptJson: function(dataDict) {
	    // TODO: use sessionKeys
	    return this.localIdentity().encryptMessageForReceiverId(JSON.stringify(dataDict), this).toString()	    
	},
	
	decryptJson: function(encryptedData) {
	    // TODO: use sessionKeys
		var decryptedData = this.localIdentity().decryptMessageFromSenderPublicKeyString(encryptedData, this.publicKeyString())
		if (decryptedData) {
		    return JSON.parse(decryptedData)	    
	    }
	    return null
	},

})
