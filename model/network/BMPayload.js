
/*

    BMPayload
    
    Object to:
    
        sign, encrypt, compute pow 
        
    of message before sending. and to:
    
        verify pow, decrypt, verify signature
    
    of a received message.
    
    NOTE: the "un" prefix is used for consistency/simplicity.
    It makes it easier to see how the methods are paired.
    
    Example uses:
    
        // sending
    
        var payload = BMPayload.clone()
        payload.setData(originalMsgDict)
        payload.encrypt(senderPrivateKey, receiverPubkey)
        payload.pow()
        var wrappedMsgDict = payload.data()
        
        // receiving - throws exception on error
        
        try {
            var payload = BMPayload.clone()
            payload.setData(wrappedMsgDict)  
            payload.unpow()
            payload.unencrypt(receiverPrivateKey)
            var originalMsgDict =  payload.data()  
            var senderPublicKey = payload.senderPublicKey()
        } catch(error) {
            ...
        }
    
*/

/*
var stableStringify = require('json-stable-stringify');
var bitcore = require("bitcore-lib")
var ECIES = require("bitcore-ecies")
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

// ideal.js also has String.base64Encoded,  String.base64Decoded

// timestamp?

BMPayload = ideal.Proto.extend().newSlots({
    type: "BMPayload",
    data: null,
    error: null,
    senderPublicKey: null,
    powObject: null,
}).setSlots({
    init: function () {
        this.setPowObject(BMPow.clone())
    },
    
    // errors
    
    throwError: function(errorString) {
        this.setError(errorString)
        throw errorString 
    },
    
    setData: function(d) {
        if (typeof(d) != "object") {
            throw "attempt to set data to non object type of '" + typeof(d) + "'"
        }
        this._data = d
        return this
    },
        
    assertType: function(typeName) {
        
        if (typeof(this._data.type) != "string") {
            console.log(this._data)
            throw "Payload data type is a " + typeof(this._data.type)
        }
        
        if (this._data.type != typeName) {
            console.log("expected type '" + typeName + "' but found '" + this._data.type + "' for payload:")
            console.log(this._data)
            //console.log(JSON.stringify(this._data))
            this.throwError(this._data.type + " != " + typeName)
        }
    },
    
    /*
    
    // ECIES encryption signs so we don't need this
    
    /// sign / unsign

    sign: function(senderPrivateKey) {
        var bitcoreMessage = new BitcoreMessage(this.data());
        var signature = bitcoreMessage.sign(senderPrivateKey);

        this.setData({ 
            type: "SignedPayload", 
            senderAddress: senderPrivateKey.toPublicKey().toAddress(), 
            signature: signature, 
            payload: stableStringify(this.data()) 
        })
            
        return this
    },
    
    unsign: function() {
        this.assertType("SignedPayload")
        var verified = new BitcoreMessage(this.data().payload).verify(this.data().senderAddress, this.data().signature);
        this.setData(this.data().payload)
        return this
    },

    */

    /// encrypt / unencrypt

    encrypt: function(senderPrivateKey, receiverPubkey) {
        var encryptor = ECIES()
          .privateKey(senderPrivateKey)
          .publicKey(receiverPubkey);

        var encryptedPayloadBuf = encryptor.encrypt(this.data().toJsonStableString());
        var encryptedPayload = encryptedPayloadBuf.toString('base64');
        
        this.setData({ 
            type: "EncryptedPayload",
            senderPublicKey: senderPrivateKey.toPublicKey().toString(),
            payload: encryptedPayload,
        })
        
        return this
    },

    unencrypt: function(receiverPrivateKey) {
        this.assertType("EncryptedPayload")

        var spk = this.data().senderPublicKey
        
        if (PublicKey.isValid(spk)) {
            throw "invalid sender public key"
        }
                
        var senderPublicKey =  new bitcore.PublicKey(spk)

        this.setSenderPublicKey(senderPublicKey)
        
        var decryptor = ECIES()
          .privateKey(receiverPrivateKey)
          .publicKey(senderPublicKey);
          
        var encryptedPayloadBuf = new Buffer(this.data().payload, 'base64')          

        try {
            var decryptedBuf = decryptor.decrypt(encryptedPayloadBuf)
        } catch(error) {
            this.throwError("invalid signature found during decryption " + error)            
        }
        
        var decryptedPayloadDict = decryptedBuf.toString().toJsonDict();
        
        this.setDict(decryptedPayloadDict)
        
        return this
    },
    
    /// pow / unpow
    
    pow: function() {
        // data -> { type: "PowedPayload", payload: data, pow: powString }
        
        var hash = this.data().toJsonStableString().sha256String();
        var pow = this.powObject()
        pow.setHash(hash)
        pow.syncFind()
        this.setData({ type: "PowedPayload", payload: this.data(), pow: pow.powHex() })
        return true
    },  
    
    asyncPow: function() {
        // data -> { type: "PowedPayload", payload: data, pow: powString }
        
        var hash = this.data().toJsonStableString().sha256String();
        var pow = this.powObject()
        pow.setHash(hash)
        pow.asyncFind()
        this.setData({ type: "PowedPayload", payload: this.data(), pow: pow.powHex() })
        return true
    },  
      
    unpow: function() {
        // { type: "PowedPayload", payload: data, pow: aPow } -> data

        this.assertType("PowedPayload")

        var hash = this.data().payload.toJsonStableString().sha256String();

        var pow = BMPow.clone().setHash(hash).setPowHex(this.data().pow)

        if (pow.isValid()) {
           pow.show()
           this.setData(this.data().payload)
        } else {
            pow.show()
            this.throwError("invalid pow")
            return false
        }
        
        return true
    },    
    
})
