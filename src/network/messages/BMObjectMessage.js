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
 
        var m = BMObjectMessage.clone()
        m.setSenderPublicKeyString(localId.publicKeyString())
        m.setEncryptedData(remoteId.encryptJson(dataDict)) // content assumed to be a dict
        m.makeTimeStampNow()
        m.signWithSenderId(localId)
        m.send()
    
    // receiving (m is a BMObjectMessage)
    // will get keys from localIdentities to attempt decryption
    // returns null is failed
    
        var content = m.content()     
        
*/

"use strict"

var BitcoreMessage = require('bitcore-message');

window.BMObjectMessage = BMMessage.extend().newSlots({
    type: "BMObjectMessage",
    msgType: "object",
    senderPublicKeyString: null,
    //receiverPublicKeyString: null,
	timeStamp: null,
	encryptedData: null,
	data: null,
    msgHash: null, // hash of data - computed as needed    
	signature: null, // sender signature on msgHash
}).setSlots({
    init: function () {
        BMMessage.init.apply(this)
		this.setShouldStoreSubnodes(false)
        this.setMsgType("object")
        this.addStoredSlots(["msgType", "encryptedData", "data", "senderPublicKeyString", "timeStamp", "signature"])
        this.addAction("delete")
    },
    
    duplicate: function() {
		var objMsg = BMObjectMessage.clone()
		objMsg.setMsgDict(this.msgDict())
        return objMsg
    },
    
    setNode: function(aNode) {
        BMMessage.setNode.apply(this, [aNode])
        console.log("BMObjectMessage setNode " + aNode ? aNode.type() : aNode)
        return this
    },

    network: function() {
        return window.app.network()
    },
    
    title: function () {
        var h = this.msgHash() ? this.msgHash().slice(0, 4) : "null"
        return this.msgType() + " " + h
    },
    
    // dict 
    
    setMsgDict: function(dict) {
        //console.log(this.type() + " setMsgDict ", dict)
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
    },
    
    msgDict: function() {
        var dict = {
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
    },

	theDictToHash: function() {
		var dict = this.msgDict()
		delete dict.msgHash   // remove this slots as we are computing hash itself
		delete dict.sig // remove this slot as signature is done on hash
		return dict
	},
    
	// hash
	
	computeMsgHash: function() {
		var s = this.theDictToHash().toJsonStableString()
		var hash = s.sha256String()
		//console.log(this.typeId() + "\n    dict: ", s, "\n    computed hash: " + hash)
		return hash
	},

    msgHash: function() {
        if (!this._msgHash) {
            this._msgHash = this.computeMsgHash();
        }
        
        return this._msgHash
    },
    
    hash: function() {
        return this.msgHash()
    },

	// sign and verify
	
	signWithSenderId: function(senderId) {
		this.setSignature(senderId.signatureForMessageString(this.msgHash()))
		return this
	},
    
	makeTimeStampNow: function() {
		this.setTimeStamp(Math.floor(new Date().getTime()/1000))
		return this
	},
	
	ageInSeconds: function() {
		var nowInSecs = new Date().getTime()/1000
		return nowInSecs - this.timeStamp()
	},

	hasValidSignature: function() {
		var spk = new bitcore.PublicKey(this.senderPublicKeyString());
        var isValid = BitcoreMessage(this.msgHash()).verify(spk.toAddress(), this.signature());
		//console.log("hasValidSignature: " + verified)
		return isValid
	},
	    
    send: function() {
		this.scheduleSyncToStore()
		//console.log(">>> "+ this.typeId() + ".send() adding to network messages")
        this.network().messages().addMessage(this)
        return this
    },

    isDeleted: function() {
        return this.network().messages().hasDeletedHash(this.hash())
    },
    
    delete: function() {
        this.network().messages().deleteObjMsg(this)
        return this
    },

	hasValidationErrors: function() {
		return this.validationErrors().length != 0
	},
	
	validationErrors: function() {
		var errors = []

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
	},
})