"use strict"

/*

    BMAppMessage

*/

window.BMAppMessage = class BMAppMessage extends BMFieldSetNode {
    
    initPrototype () {
        this.newSlot("senderId", null).setShouldStoreSlot(true)
        this.newSlot("receiverId", null).setShouldStoreSlot(true)
        this.newSlot("objMsg", null).setShouldStoreSlot(true)
        this.newSlot("hasRead", false)
        this.setShouldStore(true)
    }

    init () {
        super.init()
    }

    senderPublicKeyString () {
        const rid = this.senderId()
        if (rid) {
            return rid.publicKeyString()
        }
        return null
    }
    
    // ------------------------
	
    duplicate () {
	    assert(this.objMsg() !== null)
        const obj = window[this.type()].clone()
        obj.setSenderId(this.senderId())
        obj.setReceiverId(this.receiverId())
        obj.setObjMsg(this.objMsg())
        obj.setDataDict(this.dataDict())
        this.debugLog(" duplicated to " + obj.typeId())
        return obj
    }

    contentDict () {
        throw new Error(this.type() + " subclasses should override contentDict")
        const contentDict = {}
        return contentDict
    }
	
    setContentDict (contentDict) {
        throw new Error(this.type() + " subclasses should override setContentDict")
        return this
    }
	
    dataDict () {
        const dataDict = {}
        dataDict.type = this.type()
        dataDict.data = this.contentDict()
        return dataDict
    }

    setDataDict (dataDict) {
	    this.setContentDict(dataDict.data)		
        return this
    }

    setDecryptedData (decryptedData) {
        return this
    }
	
    isSent () {
        return this.objMsg() !== null
    }
	
    canEdit () {
        return !this.isSent()
    }

    sendToRemoteId (rid) {
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
    }
    
    hash () {
        if (this.objMsg()) {
            return this.objMsg().msgHash()
        }
        return this.typeId()
    }
	
    isEqual (other) {
        return this.hash() === other.hash()
    }
	    
    fromDataDict (dataDict) {
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
    }

    prepareToDelete () {
        if (this.objMsg()) {
            this.objMsg().delete()
        }
    }
	
    // --- public posts ----
	
    postFromSender (lid) {
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
    }
    
    // updating hasRead
    
    nodeBecameVisible () {
        super.nodeBecameVisible()

        if (!this.hasRead()) {
            this.setHasRead(true)
            this.parentNode().didUpdateNode()
        }

        return this
    }
    
}.initThisClass()
