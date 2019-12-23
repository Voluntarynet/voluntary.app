/*

	BMObjMessage

    // msgDict structure:
    
        ObjectMessage = {
            type: "object"
            sender: "...",
            encryptedData: "",
            ts: "...",
			sig: "...",
			pow: "...", // optional
        }
 
    // sending
 
        const m = BMObjectMessage.clone()
        m.setSenderPublicKeyString(localId.publicKeyString())
        m.setEncryptedData(remoteId.encryptJson(dataDict)) // content assumed to be a dict
        m.makeTimeStampNow()
        m.signWithSenderId(localId)
        m.send()
    
    // receiving (m is a BMObjectMessage)
    // will get keys from localIdentities to attempt decryption
    // returns null is failed
    
        const content = m.content()     
        
*/

"use strict"

var BitcoreMessage = require("bitcore-message");

window.BMObjectMessage = class BMObjectMessage extends BMMessage {
    
    initPrototype () {
        this.overrideSlot("msgType", "object").setShouldStoreSlot(true)
        this.newSlot("encryptedData", null).setShouldStoreSlot(true)
        this.overrideSlot("data", null).setShouldStoreSlot(true)
        this.newSlot("senderPublicKeyString", null).setShouldStoreSlot(true)
        //this.newSlot("receiverPublicKeyString", null).setShouldStoreSlot(true)
        this.newSlot("timeStamp", null).setShouldStoreSlot(true)
        this.newSlot("signature", null).setShouldStoreSlot(true)

        this.newSlot("msgHash", null)

        this.setCanDelete(true)
        this.setShouldStoreSubnodes(false)
    }

    init () {
        super.init()
        //this.setMsgType("object")
    }
    
    duplicate () {
        const objMsg = BMObjectMessage.clone()
        objMsg.setMsgDict(this.msgDict())
        return objMsg
    }
    
    setNode (aNode) {
        super.setNode(aNode)

        console.log("BMObjectMessage setNode " + aNode ? aNode.type() : aNode)
        return this
    }

    network () {
        return App.shared().network()
    }
    
    title () {
        const h = this.msgHash() ? this.msgHash().slice(0, 4) : "null"
        return this.msgType() + " " + h
    }
    
    // dict 
    
    setMsgDict (dict) {
        //this.debugLog(" setMsgDict ", dict)
        //this.setPow(dict.pow)
        //this.setSignature(dict.signature)
        this.setMsgType(dict.msgType)
        this.setEncryptedData(dict.encryptedData)            
        this.setData(dict.data)            
        this.setSenderPublicKeyString(dict.sender)            
        //this.setReceiverPublicKeyString(dict.receiver)            
        this.setTimeStamp(dict.ts)            
        this.setSignature(dict.sig)            
        return this
    }
    
    msgDict () {
        const dict = {
            msgType: this.msgType(),
            sender: this.senderPublicKeyString(),
            //receiver: this.receiverPublicKeyString(),
            ts: this.timeStamp(),
            sig: this.signature(),
            //pow: this.pow(),
        }

        if (this.encryptedData()) {
            dict.encryptedData = this.encryptedData()
        }
        
        if (this.data()) {
            dict.data = this.data()
        }
        
        return dict
    }

    theDictToHash () {
        const dict = this.msgDict()
        delete dict.msgHash   // remove this slots as we are computing hash itself
        delete dict.sig // remove this slot as signature is done on hash
        return dict
    }
    
    // hash
	
    computeMsgHash () {
        const s = Object.toJsonStableString(this.theDictToHash())
        const hash = s.sha256String()
        //this.debugLog("\n    dict: ", s, "\n    computed hash: " + hash)
        return hash
    }

    msgHash () {
        if (!this._msgHash) {
            this._msgHash = this.computeMsgHash();
        }
        
        return this._msgHash
    }
    
    hash () {
        return this.msgHash()
    }

    // sign and verify
	
    signWithSenderId (senderId) {
        this.setSignature(senderId.signatureForMessageString(this.msgHash()))
        return this
    }
    
    makeTimeStampNow () {
        this.setTimeStamp(Math.floor(new Date().getTime()/1000))
        return this
    }
	
    ageInSeconds () {
        const nowInSecs = new Date().getTime()/1000
        return nowInSecs - this.timeStamp()
    }

    hasValidSignature () {
        const spk = new bitcore.PublicKey(this.senderPublicKeyString());
        const isValid = BitcoreMessage(this.msgHash()).verify(spk.toAddress(), this.signature());
        //console.log("hasValidSignature: " + verified)
        return isValid
    }
	    
    send () {
        this.scheduleSyncToStore()
        //console.log(">>> "+ this.typeId() + ".send() adding to network messages")
        this.network().messages().addMessage(this)
        return this
    }

    isDeleted () {
        return this.network().messages().hasDeletedHash(this.hash())
    }
    
    delete () {
        this.network().messages().deleteObjMsg(this)
        return this
    }

    hasValidationErrors () {
        return this.validationErrors().length !== 0
    }
	
    validationErrors () {
        const errors = []

        if (!this.senderPublicKeyString()) {
            errors.push("missing senderPublicKeyString")
        }
				
        if (!this.signature()) {
            errors.push("missing signature")
        }
				
        if (!this.timeStamp()) {
            errors.push("missing timeStamp")
        } else if (!this.hasValidSignature()) {
            errors.push("invalid signature")
        }
			
        if (!this.timeStamp()) {
            errors.push("missing timeStamp")
        } else if (this.ageInSeconds() < 0) {
            errors.push("invalid timeStamp - not in the past")
            return false
        }
		
        if (!this.encryptedData() && !this.data()) {
            errors.push("no encryptedData or data fields")
        }
		
        return errors
    }
    
}.initThisClass()

