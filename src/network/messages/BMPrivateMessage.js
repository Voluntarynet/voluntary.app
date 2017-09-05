
BMPrivateMessage = BMFieldSetNode.extend().newSlots({
    type: "BMPrivateMessage",
	objMsg: null,
	senderPublicKeyString: null,
	receiverPublicKeyString: null,
	canReceive: false,
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
		this.setShouldStore(true)
		this.addStoredSlots(["senderPublicKeyString", "receiverPublicKeyString"])
    },

	// ids

	senderId: function() {
		if (!App.shared().network()) { return null }
		var senderId = App.shared().network().idWithPublicKeyString(this.senderPublicKeyString())      
		return senderId
	},
	
	receiverId: function() {
		if (!App.shared().network()) { return null }
        var receiverId = App.shared().network().idWithPublicKeyString(this.receiverPublicKeyString())
		return receiverId
	},

	// set pubkeys from inputs

    localIdentity: function() {
        var localId = this.parentNodeOfType("BMLocalIdentity")
        //console.log("localId = ", localId)
        assert(typeof(localId) != "null")
		assert(localId.type() == "BMLocalIdentity")
        return localId
    },
    
	localIdentityIsSender: function() {
	    if (this.senderId()) {
		    return this.senderPublicKeyString() == this.localIdentity().publicKeyString()
		}
		return false
	},

    // ------------------------

	canSend: function() {
		return (this.senderPublicKeyString() != null) && (this.receiverPublicKeyString() != null)
	},
	
	duplicate: function() {
	    assert(this.objMsg() != null)
		return window[this.type()].clone().setObjMsg(this.objMsg())
	},

	setObjMsg: function(objMsg) {
		this._objMsg = objMsg
		assert(objMsg.senderPublicKeyString())
		assert(objMsg.receiverPublicKeyString())

		this.setSenderPublicKeyString(objMsg.senderPublicKeyString())
		this.setReceiverPublicKeyString(objMsg.receiverPublicKeyString())
		this.setDataDict(objMsg.data())
		return this
	},

	contentDict: function() {
		return {}
	},
	
    dataDict: function() {
		var contentDict = this.contentDict()
		var encryptedData = this.senderId().encryptMessageForReceiverId(JSON.stringify(contentDict), this.receiverId()).toString()
				
        var dataDict = {}
		dataDict.type = this.type()
		dataDict.encryptedData = encryptedData

        return dataDict
    },


	setDataDict: function(dict) {
		var senderId   = this.senderId()
		var receiverId = this.receiverId()
		
		if (!senderId) {
			console.log("no contact for senderPublicKey '" + dict.senderPublicKey + "'")
			return this
		}
				
		if (!receiverId) {
			console.log("no identity for receiverPublicKey '" + dict.receiverPublicKey + "'")
			return this
		}

		if (receiverId.hasPrivateKey()) {
			var spk = senderId.publicKeyString()
			//console.log("spk = ", spk)
			var decryptedData = receiverId.decryptMessageFromSenderPublicKeyString(dict.encryptedData, spk)
			this.setDecryptedData(decryptedData)
		}
		
		this.setCanReceive(true)
		
		return this
	},

	setDecryptedData: function(decryptedData) {
		return this
	},

	place: function() {
		console.log("placing " + this.type() + " from '" + this.senderId().name() + "' to '" + this.receiverId().name() + "'")
		
		if(!this.canReceive()) {
			console.log("can't receive message")
			return
		}
		
		if (this.receiverId()) {
			this.receiverId().handleMessage(this.duplicate())
		}
		
		if (this.senderId()) {
         	this.senderId().handleMessage(this.duplicate())	
		}
		
		return this
	},
	
	isSent: function() {
		return this.objMsg() != null
	},
	
	canEdit: function() {
		return !this.isSent()
	},
	
	composeObjMsg: function() {
        var objMsg = BMObjectMessage.clone()

        objMsg.setSenderPublicKeyString(this.senderPublicKeyString())
        objMsg.setReceiverPublicKeyString(this.receiverPublicKeyString())

        objMsg.setData(this.dataDict())
		objMsg.makeTimeStampNow()
		
    	/*
		objMsg.powObj().setTargetDifficulty(17)
        objMsg.asyncFindPowAndSend()
		*/
		
		objMsg.signWithSenderId(this.senderId())
        this.setObjMsg(objMsg)
		return this	    
	},

    send: function () {
        this.composeObjMsg()
		this.objMsg().send()
    },
})
