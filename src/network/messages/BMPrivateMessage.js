
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
        var dataDict = {}
		dataDict.type = this.type()
		dataDict.data = this.contentDict()
        return dataDict
    },

	setDataDict: function(dataDict) {
	    this.setContentDict(dataDict.data)		
		return this
	},

	setDecryptedData: function(decryptedData) {
		return this
	},
	
	isSent: function() {
		return this.objMsg() != null
	},
	
	canEdit: function() {
		return !this.isSent()
	},

    sendToRemoteId: function (rid) {
        console.log("rid = ", rid.typeId())
        var lid = rid.localIdentity()
        this.setSenderPublicKeyString(lid.publicKeyString())
		this.setReceiverPublicKeyString(rid.publicKeyString())
        
        var objMsg = BMObjectMessage.clone()
        objMsg.setSenderPublicKeyString(lid.publicKeyString())
        objMsg.setEncryptedData(rid.encryptJson(this.dataDict()))
		objMsg.makeTimeStampNow()
		objMsg.signWithSenderId(lid)
        this.setObjMsg(objMsg)
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
        
        return proto.clone().setDataDict(dataDict)
    },
})
