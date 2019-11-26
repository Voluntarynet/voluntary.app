"use strict"

/*

    BMAppMessage

*/

BMFieldSetNode.newSubclassNamed("BMAppMessage").newSlots({
    objMsg: null,
    senderId: null,
    receiverId: null,
    hasRead: false,
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
        this.setShouldStore(true)
        this.addStoredSlots(["senderId", "receiverId", "objMsg"])
    },

    senderPublicKeyString: function() {
        const rid = this.senderId()
        if (rid) {
            return rid.publicKeyString()
        }
        return null
    },
    
    // ------------------------
	
    duplicate: function() {
	    assert(this.objMsg() !== null)
        const obj = window[this.type()].clone()
        obj.setSenderId(this.senderId())
        obj.setReceiverId(this.receiverId())
        obj.setObjMsg(this.objMsg())
        obj.setDataDict(this.dataDict())
        this.debugLog(" duplicated to " + obj.typeId())
        return obj
    },

    contentDict: function() {
        throw new Error(this.type() + " subclasses should override contentDict")
        const contentDict = {}
        return contentDict
    },
	
    setContentDict: function(contentDict) {
        throw new Error(this.type() + " subclasses should override setContentDict")
        return this
    },
	
    dataDict: function() {
        const dataDict = {}
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
        return this.objMsg() !== null
    },
	
    canEdit: function() {
        return !this.isSent()
    },

    sendToRemoteId: function (rid) {
        //console.log("rid = ", rid.typeId())
        const lid = rid.localIdentity()
        this.setSenderId(lid)
        this.setReceiverId(rid)
        
        const objMsg = BMObjectMessage.clone()
        objMsg.setSenderPublicKeyString(lid.publicKeyString())
        objMsg.setEncryptedData(rid.encryptJson(this.dataDict()))
        objMsg.makeTimeStampNow()
        objMsg.signWithSenderId(lid)
        if (objMsg.hasValidationErrors()) {
            this.debugLog(".sendToRemoteId() validationErrors:" + objMsg.hasValidationErrors().join(","))
        } else {
        	this.setObjMsg(objMsg)
            this.objMsg().send()
        }
        return this
    },
    
    hash: function() {
        if (this.objMsg()) {
            return this.objMsg().msgHash()
        }
        return this.typeId()
    },
	
    isEqual: function(other) {
        return this.hash() === other.hash()
    },
	    
    fromDataDict: function(dataDict) {
        const className = dataDict.type
        if (!className) {
            return null
        }

        if (!className.endsWith("Message")) {
            return null
        }
        
        const proto = window[className]
        if (!proto) {
            return null
        }
        
        //this.debugLog(" fromDataDict() dataDict = ", dataDict)
        return proto.clone().setDataDict(dataDict)
    },

    prepareToDelete: function() {
        if (this.objMsg()) {
            this.objMsg().delete()
        }
    },
	
    // --- public posts ----
	
    postFromSender: function (lid) {
        this.setSenderId(lid)
        
        const objMsg = BMObjectMessage.clone()
        objMsg.setSenderPublicKeyString(lid.publicKeyString())
        objMsg.setData(this.dataDict())
        objMsg.makeTimeStampNow()
        objMsg.signWithSenderId(lid)
        if (objMsg.hasValidationErrors()) {
            this.debugLog(".sendToRemoteId() validationErrors:" + objMsg.hasValidationErrors().join(","))
        } else {
        	this.setObjMsg(objMsg)
            this.objMsg().send()
            this.debugLog(".postFromSender() sent!")
        }
        return this
    },
    
    // updating hasRead
    
    nodeBecameVisible: function() {
        BMFieldSetNode.nodeBecameVisible.apply(this)

        if (!this.hasRead()) {
            this.setHasRead(true)
            this.parentNode().didUpdateNode()
        }

        return this
    },
    
}).initThisProto()
