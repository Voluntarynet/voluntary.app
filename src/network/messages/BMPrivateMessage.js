
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
		this.addStoredSlots(["senderPublicKeyString", "receiverPublicKeyString", "objMsg"])
    },

	// ids

	senderId: function() {
		if (!App.shared().network()) { return null }
		var senderId = App.shared().network().idWithPublicKeyString(this.senderPublicKeyString())      
		return senderId
	},
	
	receiverId: function() {
		if (!this.localIdentity()) { return null }
        var receiverId = this.localIdentity().remoteIdentities().idWithPublicKeyString(this.receiverPublicKeyString())
		return receiverId
	},

	// set pubkeys from inputs

    localIdentity: function() {
        var localId = this.parentNodeOfType("BMLocalIdentity")
        //console.log("localId = ", localId)
		//assert(localId.type() == "BMLocalIdentity")
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
		
		if (objMsg) {
    		assert(objMsg.senderPublicKeyString())
    		assert(objMsg.receiverPublicKeyString())

    		this.setSenderPublicKeyString(objMsg.senderPublicKeyString())
    		//this.setReceiverPublicKeyString(objMsg.receiverPublicKeyString())
    		this.setDataDict(objMsg.data())
    	}
		return this
	},

	contentDict: function() {
		throw (this.type() + " subclasses should override contentDict")
		var contentDict = {}
		return contentDict
	},
	
	setContentDict: function(contentDict) {
		throw (this.type() + " subclasses should override setContentDict")
		return this
	},
	
    dataDict: function() {
		var contentDict = this.contentDict()
		//console.log(this.typeId() + ".dataDict() contentDict: ", contentDict)
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
			var decryptedData = receiverId.decryptMessageFromSenderPublicKeyString(dict.encryptedData, spk)
			var contentDict = JSON.parse(decryptedData)
			this.setContentDict(contentDict)
		}
		
		this.setCanReceive(true)
		
		return this
	},

	setDecryptedData: function(decryptedData) {
		return this
	},

	place: function() {
		
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

		console.log("placing " + this.type() + " from '" + this.senderId().name() + "' to '" + this.receiverId().name() + "'")
		
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
        console.log(this.typeId() + ".composeObjMsg() this.receiverId() = ", this.receiverId().typeId())
        objMsg.setEncryptedData(this.receiverId().encryptJson(this.dataDict()))
		objMsg.makeTimeStampNow()
		
		objMsg.signWithSenderId(this.senderId())
        this.setObjMsg(objMsg)
		return this	    
	},

    send: function () {
        this.composeObjMsg()
		this.objMsg().send()
		return this
    },
    
	hash: function() {
		if (this.objMsg()) {
			return this.objMsg().msgHash()
		}
		return this.typeId()
	},
	    
    fromDataDict: function(dataDict) {
        var className = dataDict.type
        if (!className) {
            return null
        }
        
        var proto = window[className]
        if (!proto) {
            return null
        }
        
        return proto.clone().setMsgDict(dataDict)
    },
})
