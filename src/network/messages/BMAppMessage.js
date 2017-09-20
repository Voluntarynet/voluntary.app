
BMAppMessage = BMFieldSetNode.extend().newSlots({
    type: "BMAppMessage",
	objMsg: null,
	senderId: null,
	receiverId: null,
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
		this.setShouldStore(true)
		this.addStoredSlots(["senderId", "receiverId", "objMsg"])
    },

    // ------------------------
	
	duplicate: function() {
	    assert(this.objMsg() != null)
		var obj = window[this.type()].clone()
		obj.setSenderId(this.senderId())
		obj.setReceiverId(this.receiverId())
		obj.setObjMsg(this.objMsg())
		obj.setDataDict(this.dataDict())
		console.log(this.typeId() + " duplicated to " + obj.typeId())
		return obj
	},

	contentDict: function() {
		throw new Error(this.type() + " subclasses should override contentDict")
		var contentDict = {}
		return contentDict
	},
	
	setContentDict: function(contentDict) {
		throw new Error(this.type() + " subclasses should override setContentDict")
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
        this.setSenderId(lid)
		this.setReceiverId(rid)
        
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

		if (!className.endsWith("Message")) {
			return null
		}
        
        var proto = window[className]
        if (!proto) {
            return null
        }
        
		//console.log(this.type() + " fromDataDict() dataDict = ", dataDict)
        return proto.clone().setDataDict(dataDict)
    },
})
