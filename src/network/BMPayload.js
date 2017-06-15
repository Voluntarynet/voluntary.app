
/*

    BMPayload
    
    Object to:
    
        sign, encrypt, (timestamp?), compute pow 
        
    of message before sending. and to:
    
        verify pow, decrypt, verify signature
    
    of a received message.
    
    NOTE: the "un" prefix is used for consistency/simplicity.
    It makes it easier to see how the methods are paired.
    
    Example uses:
    
        // sending
    
        var payload = BMPayload.clone()
        payload.setData(originalMsgDict)
        payload.encrypt(senderPrivateKey, receiverPublicKey)
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


// ideal.js also has String.base64Encoded,  String.base64Decoded

// timestamp?

BMPayload = ideal.Proto.extend().newSlots({
    type: "BMPayload",
    data: null,
    error: null,
    senderPublicKey: null,
    powObject: null,
    donePowCallback: null,
}).setSlots({
    init: function () {
        this.setPowObject(BMPow.clone())
    },
    
    // errors
    
    throwError: function(errorString) {
        this.setError(errorString)
        throw new Error(errorString) 
    },
    
    setData: function(d) {
        if (typeof(d) != "object") {
            throw new Error("attempt to set data to non object type of '" + typeof(d) + "'")
        }
        this._data = d
        return this
    },
        
    assertType: function(typeName) {
        if (this._data == null) {
            console.log("Payload object = ", this)
            throw new Error("payload has null data ")
        }
        
        if (typeof(this._data.type) != "string") {
            console.log(this._data)
            throw new Error("Payload data type is a " + typeof(this._data.type))
        }
        
        if (this._data.type != typeName) {
            console.log("expected type '" + typeName + "' but found '" + this._data.type + "' for payload:")
            console.log(this._data)
            //console.log(JSON.stringify(this._data))
            this.throwError(this._data.type + " != " + typeName)
        }
    },
        
    // bitcoin curve is sjcl.ecc.curves.k256	    
    /*
        // Must be ECDSA!
        var pair = sjcl.ecc.ecdsa.generateKeys(256)

        var sig = pair.sec.sign(sjcl.hash.sha256.hash("Hello World!"))
        // [ 799253862, -791427911, -170134622, ...

        var ok = pair.pub.verify(sjcl.hash.sha256.hash("Hello World!"), sig)
        // Either `true` or an error will be thrown.
    */
    
    /// sign / unsign

    sign: function(senderKeyPair) {
        var payload = this.data().toJsonStableString();
        var payloadHash = sjcl.hash.sha256.hash(payload);
        var sig = senderKeyPair.sec.sign(payloadHash);
        var senderPublicKeyHex = sjcl.codec.hex.fromBits(senderKeyPair.pub);
       
        this.setData({ 
            type: "SignedPayload",
            senderAddress: senderPublicKeyHex,
            signature: sig,
            payload: payload
        })
            
        return this
    },
    
    unsign: function() {
        this.assertType("SignedPayload")
        
        var senderPublicKeyHex = this.data().senderAddress;
        var senderPublicKeyBits = sjcl.codec.hex.toBits(senderPublicKeyHex);
        
        var ok = pair.pub.verify(this.data().payload, sig);
        
        if (ok) {
            this.setData(this.data().payload);
            return true;
        }
        
        return false;
    },

    /// encrypt / unencrypt
    
    /*
    var pair = sjcl.ecc.elGamal.generateKeys(256)

        var ct = sjcl.encrypt(pair.pub, "Hello World!")
        var pt = sjcl.decrypt(pair.sec, ct)
    */

    encrypt: function(receiverPublicKeyHex) {
        var receiverPublicKeyBits = sjcl.codec.hex.toBits(receiverPublicKeyHex);
        //var unencryptedBits = sjcl.codec.utf8String(this.data().toJsonStableString());
        var encryptedBits = sjcl.encrypt(receiverPublicKeyBits, this.data().toJsonStableString());
        var encryptedBase64 = sjcl.codec.base64.fromBits(encryptedBits);
        
        this.setData({ 
            type: "EncryptedPayload",
            payload: encryptedBase64,
        })

        return this
    },

    unencrypt: function(receiverPrivateKeyHex) {
        this.assertType("EncryptedPayload")

        var receiverPrivateKeyBits = sjcl.codec.hex.toBits(receiverPrivateKeyHex)
        var encryptedBase64 = this.data().payload;
        var encryptedBits = sjcl.codec.base64.toBits(encryptedBase64)
        var decryptedBits = sjcl.decrypt(receiverPrivateKeyBits, encryptedBits)
        var decryptedString = sjcl.codec.utf8String.fromBits(encryptedBits)
        var decryptedPayloadDict = decryptedString.toJsonDict();

        if (decryptedPayloadDict == null) {
            throw "can't convert decrypted payload to JSON";    
        }
        
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
        pow.setDoneCallback(() => { this.powDone() })
        pow.asyncFind()
        return true
    },  
    
    powDone: function() {
        this.setData({ type: "PowedPayload", payload: this.data(), pow: this.powObject().powHex() })
        if (this.donePowCallback()) {
            this.donePowCallback().apply()
        }  
    },
      
    unpow: function() {
        
        // { type: "PowedPayload", payload: data, pow: aPow } -> data
        //console.log("BMPayload.unpow this.data() = ", this.data())
        
        this.assertType("PowedPayload")
        
        console.log("unpow")
        ShowStack()

        var hash = this.data().payload.toJsonStableString().sha256String();
        var pow = BMPow.clone().setHash(hash).setPowHex(this.data().pow)

        if (pow.isValid()) {
           //pow.show()
           this.setData(this.data().payload)
        } else {
            pow.show()
            this.throwError("invalid pow")
            return false
        }
        
        return pow.actualPowDifficulty()
    },
    
    actualPowDifficulty: function() {
        // { type: "PowedPayload", payload: data, pow: aPow } -> data
        // console.log("BMPayload.unpow this.data() = ", this.data())
        
        this.assertType("PowedPayload")

        var hash = this.data().payload.toJsonStableString().sha256String();
        var pow = BMPow.clone().setHash(hash).setPowHex(this.data().pow)
        return pow.actualPowDifficulty()
    },    
    
})
