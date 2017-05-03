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


// Helpers

Object.prototype.toJsonStableString = function() {
    return JSON.stableStringify(this, null, 2)
}

Object.prototype.toStableHash = function() {
    return this.toJsonStableString().sha256String();
}

String.prototype.toJsonDict = function() {
    return JSON.parse(this)
}

String.prototype.sha256String = function() {
	var shaBits = sjcl.hash.sha256.hash(this);
	var shaHex = sjcl.codec.hex.fromBits(shaBits);
    return shaHex;                
    //return bitcore.crypto.Hash.sha256(this.toBuffer()).toString('hex')
}

String.prototype.toBuffer = function () {
    return new Buffer(this, "binary")
}



BMObjectMessage = BMMessage.extend().newSlots({
    type: "BMObjectMessage",
    
    msgType: "object",
    
    pow: null,
    msgHash: null, // hash of data - computed and cached as needed    

	signature: null,
    senderPublicKey: null,
    receiverPublicKey: null,

	powObj: null,
}).setSlots({
    init: function () {
        BMMessage.init.apply(this)
		this.setShouldStoreItems(false)
        this.setMsgType("object")
        this.addStoredSlots(["msgType", "pow", "signature", "senderPublicKey", "receiverPublicKey", "data"])
        //this.setViewClassName("BMMessageView")
        this.addAction("delete")
        this.setPowObj(BMPow.clone())
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
    
    setContent: function(v) {
        //console.log(this.type() + " setContent: ", v)
        this._content = v
        //this.syncFields()
        return this
    },
    
    setNodeDict: function(dict) {
        BMStorableNode.setNodeDict.apply(this, [dict])
        //console.log("BMMessageObject.setNodeDict ", this)
        //this.syncFields()
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
        //console.log("setMsgDict ", dict)
        this.setPow(dict.pow)
        //this.setSignature(dict.signature)
        this.setMsgType(dict.msgType)
        this.setData(dict.data)            
        //this.setsenderPublicKey(dict.senderPublicKey)            
        //this.setreceiverPublicKey(dict.receiverPublicKey)            
        return this
    },
    
    msgDict: function() {
        return {
            pow: this.pow(),
            //signature: this.signature(),
            msgType: this.msgType(),
            //senderPublicKey: this.senderPublicKey(),
            //receiverPublicKey: this.receiverPublicKey(),
            data: this.data()
        }
    },

	dictToHash: function() {
		var dict = this.msgDict()
		delete dict.signature
		delete dict.msgHash
		return dict
	},
    
	// hash
	
	computeMsgHash: function() {
		return this.dictToHash().toJsonStableString().sha256String()
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
    
	verifySignature: function() {
		var spk = new PublicKey(this.senderPublicKey());
        var verified = bitcore.Message(this.msgHash()).verify(spk.toAddress(), this.signature());
		return verified
	},
	    
    send: function() {
        // adding to Messages node this would change parentNode - so make a copy?
		this.markDirty()
        this.network().messages().addMessage(this)
        return this
    },
    
	validMessageProtos: function() {
		return ["BMPrivateMessage", "BMClassifiedPost"]
	},

    place: function() {   
        var dict = this.data()

		var protoName = dict.type
		
		//console.log("placing ", protoName)
		
		if (!this.validMessageProtos().contains(protoName)) {
			console.log("'" + protoName + "'  is not a valid proto found in ", this.validMessageProtos())
			return false
		}
		
		var proto = window[protoName]
		var obj = proto.clone().setObjMsg(this).setPostDict(dict).place()
		
		//console.log("placed ", protoName)
		
		/*
        if (dict.type == "BMPrivateMessage") {
            var privateMsg = BMPrivateMessage.clone().setPostDict(dict)
			privateMsg.place()
            return true
     	}       
        else if (dict.type == "BMClassifiedPost") {			
            var post = BMClassifiedPost.clone().setPostDict(dict)
            post.setObjMsg(this)
            post.setupFromDict()
	        post.setHasSent(true)
            post.placeInRegion()
            post.placeInAll()
			return true
        }
*/
        
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

})
