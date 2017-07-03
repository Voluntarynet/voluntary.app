/*

	BMObjMessage
	{
		pow (on hash of what's below) [optional]
		signature (on hash what's below) [optional]
				msgType
				senderPublicKey	
				receiverPublicKey
				data 
	}

    // msgDict structure:
    
        ObjectMessage = {
			pow: "...",
			signature: "...",
            msgType: "object"
            senderPublicKey: "...",
            receiverPublicKey: "...",
            uuid: "...",
        }
 
    // sending
 
        var m = BMObjectMessage.clone()
        m.setFromId(senderId)
        m.setToId(receiverId)
        m.setContent(content) // content assumed to be a dict
        m.send()
    
    // receiving (m is a BMObjectMessage)
    // will get keys from localIdentities to attempt decryption
    // returns null is failed
    
        var content = m.content()     
        
*/


var BitcoreMessage = require('bitcore-message');

BMObjectMessage = BMMessage.extend().newSlots({
    type: "BMObjectMessage",
    msgType: "object",

    senderPublicKeyString: null,
    receiverPublicKeyString: null,
	timeStamp: null,
    msgHash: null, // hash of data - computed as needed    
	signature: null, // sender signature on msgHash
}).setSlots({
    init: function () {
        BMMessage.init.apply(this)
		this.setShouldStoreSubnodes(false)
        this.setMsgType("object")
        this.addStoredSlots(["msgType", "data", "senderPublicKeyString", "receiverPublicKeyString", "timeStamp", "signature"])
        this.addAction("delete")
    },
    
    duplicate: function() {
		throw new Error("not sure how to duplicate properly")
        //var d = this.clone()
        //return d
        return this
    },
    
    setNode: function(aNode) {
        BMMessage.setNode.apply(this, [aNode])
        console.log("BMObjectMessage setNode " + aNode ? aNode.type() : aNode)
        return this
    },

/*    
    setContent: function(v) {
        //console.log(this.type() + " setContent: ", v)
        this._content = v
        return this
    },
*/
    
    setNodeDict: function(dict) {
        BMStorableNode.setNodeDict.apply(this, [dict])
        return this
    },
    
    nodeDict: function() {
        var dict = BMStorableNode.nodeDict.apply(this)
        //console.log("BMObjectMessage nodeDict " + JSON.stringify(dict, null, 2) )
        return dict
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
        console.log(this.type() + " setMsgDict ", dict)
        //this.setPow(dict.pow)
        //this.setSignature(dict.signature)
        this.setMsgType(dict.msgType)
        this.setData(dict.data)            
        this.setSenderPublicKeyString(dict.sender)            
        this.setReceiverPublicKeyString(dict.receiver)            
        this.setTimeStamp(dict.timeStamp)            
        this.setSignature(dict.signature)            
        return this
    },
    
    msgDict: function() {
        return {
            msgType: this.msgType(),
            data: this.data(),
            sender: this.senderPublicKeyString(),
            receiver: this.receiverPublicKeyString(),
            timeStamp: this.timeStamp(),
            signature: this.signature(),
            //pow: this.pow(),
        }
    },

	theDictToHash: function() {
		var dict = this.msgDict()
		delete dict.msgHash   // remove this slots as we are computing hash itself
		delete dict.signature // remove this slot as signature is done on hash
		return dict
	},
    
	// hash
	
	computeMsgHash: function() {
		return this.theDictToHash().toJsonStableString().sha256String()
	},

    msgHash: function() {
        if (!this._msgHash) {
            this._msgHash = this.computeMsgHash();
        }
        
        return this._msgHash
    },

	// sign and verify
	
	signWithSenderId: function(senderId) {
		this.setSignature(senderId.signatureForMessageString(this.msgHash()))
		return this
	},
    
	makeTimeStampNow: function() {
		this.setTimeStamp(new Date().getTime())
		return this
	},

	verifySignature: function() {
		var spk = new bitcore.PublicKey(this.senderPublicKeyString());
        var verified = BitcoreMessage(this.msgHash()).verify(spk.toAddress(), this.signature());
		//console.log("verifySignature: " + verified)
		return verified
	},
	    
    send: function() {
        // adding to Messages node this would change parentNode - so make a copy?
		this.markDirty()
        this.network().messages().addMessage(this)
        return this
    },

	isValidDataMessage: function() {
		return this.verifySignature()
		/*
        var dict = this.data()
		var protoName = dict.type
	    var valid = this.validMessageProtos().contains(protoName)
	    
		if (!valid) {
			console.log("'" + protoName + "'  is not a valid proto found in ", this.validMessageProtos())
		}	    
		
	    return valid
		*/
	},

    place: function() {   
        var dict = this.data()

		var protoName = dict.type
				
		if (!this.isValidDataMessage()) {
			return false
		}
		
		var proto = window[protoName]
		//console.log("BMObjectMessage placing dict = ", dict)
		var obj = proto.clone().setObjMsg(this).setPostDict(dict).place()
        
        return false
    },

	// ---- pow ------------------------------------------------
	
    /// pow / unpow
    
/*
    pow: function() {        
        var hash = this.msgHash()
        var pow = this.powObject()
        pow.setHash(hash)
        pow.syncFind()
        this.setPow(pow.powHex())
        return true
    },  
*/
  
/*  
    asyncFindPowAndSend: function() {        
        var hash = this.msgHash()
        var pow = this.powObj()
        pow.setHash(hash)
        pow.setDoneCallback(() => { this.powDone() })
        pow.asyncFind()
        return true
    },  
    
    powDone: function() {
        this.setPow(this.powObj().powHex())
		this.send()
		return this
    },
    
    actualPowDifficulty: function() {
		if (this.pow()) {
	        var pow = BMPow.clone().setHash(this.msgHash()).setPowHex(this.pow())
	        return pow.actualPowDifficulty()
		}
		return 0
    },
*/

	setPow: function() {
		
	},

})
