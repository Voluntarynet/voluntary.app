
BMPrivateMessage = BMFieldSetNode.extend().newSlots({
    type: "BMPrivateMessage",
    status: "",
    isSent: false,
	canReceive: false,
	objMsg: null,
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
		this.setShouldStore(true)

        this.addFieldNamed("stamp").setKey("stamp").setValueIsEditable(false)
		this.setStamp("Unstamped")
		
		//this.addField(BMIdentityField.clone().setNodeFieldProperty("fromAddress").setKey("from").setValueIsEditable(false))
		//this.addField(BMIdentityField.clone().setNodeFieldProperty("toAddress").setKey("to").setValueIsEditable(true))
		
		this.addField(BMMultiField.clone().setKey("from").setNodeFieldProperty("fromContact")).setValueIsEditable(false).setValidValuesMethod("fromContactNames").setNoteMethod("fromContactPublicKey")
		this.addField(BMMultiField.clone().setKey("to").setNodeFieldProperty("toContact")).setValueIsEditable(true).setValidValuesMethod("toContactNames").setNoteMethod("toContactPublicKey")
        this.addFieldNamed("subject").setKey("subject")	
		this.addField(BMTextAreaField.clone().setKey("body").setNodeFieldProperty("body"))
        this.setStatus("")

        this.setActions(["send", "delete"])
        this.setNodeMinWidth(600)
        this.setNodeBgColor("white")

		//this.didUpdate()
    },

	duplicate: function() {
		var dup = BMPrivateMessage.clone().copyFieldsFrom(this)
		dup.setIsSent(true)
		return dup
	},

    prepareToSyncToView: function() {
		BMFieldSetNode.prepareToSyncToView.apply(this)
		
		if (this.localIdentity()) {
			//this.setFromAddress(this.localIdentity().publicKeyString())
			this.setFromContact(this.localIdentity().name())
		}
	},

	fromContactNames: function() {
		//console.log("App.shared().network().localIdentityNames() = ", App.shared().network().localIdentityNames())
		return App.shared().network().localIdentityNames()
	},

	toContactNames: function() {
		//return App.shared().network().remoteIdentityNames()
		return App.shared().network().allIdentityNames()
	},

	localIdentity: function() {
		if (this.drafts()) {
			return this.drafts().parentNode()
		}
		return null
	},

/*
	setParentNode: function(aNode) {
		BMFieldSetNode.setParentNode.apply(this, [aNode])
		this.validateFromAddress()
		return this
	},   
	*/
	
	toContactPublicKey: function() {
		if (this.receiverId()) {
			return this.receiverId().publicKeyString()
		}
		return null
	},	
	
	fromContactPublicKey: function() {
		if (this.senderId()) {
			return this.senderId().publicKeyString()
		}
		return null
	},
	
	/*
	useDefaultFromAddress: function() {
		if (this.localIdentity()) {
			this.setFromContact(this.localIdentity().name())
		}
	},
	*/
	
	validateFromAddress: function() {
		if (this.localIdentity()) {
			this.setFromContact(this.localIdentity().name())
		}
	},
    
    title: function() {
		var s = this.toContact()
        if (s) {
            return s
        }		
        return "No recipient"
    },
    
    subtitle: function () {
        var s = this.subject()
        if (s) {
            return s
        }
        return "No subject"
    },   
    
    // ------------------------

    postDict: function() {
        var senderId = this.senderId()       
        var receiverId = this.receiverId()

		if (!this.senderId()) {
			throw new Error("missing senderId")
		}
		
		if (!this.receiverId()) {
			throw new Error("missing receiverId")
		}		
		
		var contentDict = {}
		contentDict.subject = this.subject()
		contentDict.body = this.body()
		var encryptedData = senderId.encryptMessageForReceiverId(JSON.stringify(contentDict), receiverId).toString()
				
        var dict = {}
		dict.type = "BMPrivateMessage"
		dict.senderPublicKey   = senderId.publicKeyString()
		dict.receiverPublicKey = receiverId.publicKeyString()
		dict.encryptedData = encryptedData
		//dict.signature = senderId.signatureForMessageString(dict.toJsonStableString().sha256String())

        return dict
    },

	canSend: function() {
		return (this.senderId() != null) && (this.receiverId() != null)
	},


	setPostDict: function(dict) {
		
		//console.log("dict.senderPublicKey = ", dict.senderPublicKey)
		//console.log("dict.receiverPublicKey = ", dict.receiverPublicKey)
		
		var senderId = App.shared().network().idWithPubKeyString(dict.senderPublicKey)
		var receiverId = App.shared().network().localIdentities().idWithPubKeyString(dict.receiverPublicKey)
		
		this.setCanReceive(true)
		
		if (!senderId) {
			console.log("no contact for senderPublicKey '" + dict.senderPublicKey + "'")
			this.setCanReceive(false)
			return this
		}
				
		if (!receiverId) {
			this.setCanReceive(false)
			console.log("no contact for receiverPublicKey '" + dict.receiverPublicKey + "'")
			return this
		}
		
		//console.log(this.type() + ".setPostDict(" + JSON.stringify(dict, null, 2) + ")")

		
		this.setFromContact(senderId.name())
		this.setToContact(receiverId.name())

		
		//console.log("dict = ", dict)
		//console.log("dict.encryptedBuffer = ", dict.encryptedData)
		
		var decryptedData = receiverId.decryptMessageFromSenderPublicKeyString(dict.encryptedData, dict.senderPublicKey)
		
		if (!decryptedData) {
			this.setSubject("[unable to decrypt message]")
			this.setBody("[unable to decrypt message]")
		} else {
			//console.log("decryptedData = ", decryptedData)
			var contentDict = JSON.parse(decryptedData)
			//console.log("contentDict = ", contentDict)
			this.setSubject(contentDict.subject)
			this.setBody(contentDict.body)
		}		
		
		
		return this
	},

	place: function() {
		//console.log("placing " + this.type() + " from '" + this.senderId().name() + "' to '" + this.receiverId().name() + "'")
		
		if(!this.canReceive()) {
			console.log("can't receive message")
			return
		}

		this.isSent(true)
		
		if (this.receiverId()) {
			this.receiverId().fileMessage(this.duplicate())
		}
		
		if (this.senderId()) {
         	this.senderId().fileMessage(this.duplicate())	
		}
		
		//this.didUpdate()
	},
    
    
    drafts: function() {
        return this.parentNode()
    },
	
	/*
	didLoadFromStore: function() {
		this.validate()
		return this
	},
	*/

	canEdit: function() {
		return !this.isSent()
	},
	
	prepareToSyncToView: function() {
		BMFieldSetNode.prepareToSyncToView.apply(this)
		
		if (this.canSend()) {
			this.addAction("send")
		} else {
			this.removeAction("send")
		}
		
		this.fieldNamed("from").setValueIsEditable(this.canEdit())
		this.fieldNamed("to").setValueIsEditable(this.canEdit())
		this.fieldNamed("subject").setValueIsEditable(this.canEdit())
		this.fieldNamed("body").setValueIsEditable(this.canEdit())
		
		/*
		console.log(this.type() + " prepareToSyncToView")
		console.log("-- this.fromContact() = ", this.fromContact())
		console.log("-- this.toContact() = ", this.toContact())	
		*/	
		return this
	},
    
	senderId: function() {
		if (!App.shared().network()) { return null }
		var senderId = App.shared().network().idWithName(this.fromContact())      
		return senderId
	},
	
	receiverId: function() {
		if (!App.shared().network()) { return null }
        var receiverId = App.shared().network().idWithName(this.toContact())
		return receiverId
	},

    send: function () {
        var objMsg = BMObjectMessage.clone()
        objMsg.setData(this.postDict())
    	objMsg.powObj().setTargetDifficulty(17)
        objMsg.asyncFindPowAndSend()
        this.delete()
    },
})
