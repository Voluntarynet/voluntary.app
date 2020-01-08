
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
    
        const payload = BMPayload.clone()
        payload.setData(originalMsgDict)
        payload.encrypt(senderPrivateKey, receiverPublicKey)
        payload.pow()
        const wrappedMsgDict = payload.data()
        
        // receiving - throws exception on error
        
        try {
            const payload = BMPayload.clone()
            payload.setData(wrappedMsgDict)  
            payload.unpow()
            payload.unencrypt(receiverPrivateKey)
            const originalMsgDict =  payload.data()  
            const senderPublicKey = payload.senderPublicKey()
        } catch(error) {
            ...
        }
    
*/


// ideal.js also has String.base64Encoded,  String.base64Decoded

// timestamp?

"use strict"

window.BMPayload = class BMPayload extends ProtoClass {
    
    initPrototype () {
        this.newSlot("data", null)
        this.newSlot("error", null)
        this.newSlot("senderPublicKey", null)
        this.newSlot("powObject", null)
        this.newSlot("donePowCallback", null)
    }

    init () {
        super.init()
        this.setPowObject(BMPow.clone())
    }
    
    // errors
    
    throwError (errorString) {
        this.setError(errorString)
        throw new Error(errorString) 
    }
    
    setData (d) {
        if (typeof(d) !== "object") {
            throw new Error("attempt to set data to non object type of '" + typeof(d) + "'")
        }
        this._data = d
        return this
    }
        
    assertType (typeName) {
        if (this._data === null) {
            console.log("Payload object = ", this)
            throw new Error("payload has null data ")
        }
        
        if (typeof(this._data.type) !== "string") {
            console.log(this._data)
            throw new Error("Payload data type is a " + typeof(this._data.type))
        }
        
        if (this._data.type !== typeName) {
            console.log("expected type '" + typeName + "' but found '" + this._data.type + "' for payload:")
            console.log(this._data)
            //console.log(JSON.stringify(this._data))
            this.throwError(this._data.type + " is not equal to " + typeName)
        }
    }
        
    // bitcoin curve is sjcl.ecc.curves.k256	    
    /*
        // Must be ECDSA!
        const pair = sjcl.ecc.ecdsa.generateKeys(256)

        const sig = pair.sec.sign(sjcl.hash.sha256.hash("Hello World!"))
        // [ 799253862, -791427911, -170134622, ...

        const ok = pair.pub.verify(sjcl.hash.sha256.hash("Hello World!"), sig)
        // Either `true` or an error will be thrown.
    */
    
    /// sign / unsign

    sign (senderKeyPair) {
        const payload = Object.toJsonStableString(this.data());
        const payloadHash = sjcl.hash.sha256.hash(payload);
        const sig = senderKeyPair.sec.sign(payloadHash);
        const senderPublicKeyHex = sjcl.codec.hex.fromBits(senderKeyPair.pub);
       
        this.setData({ 
            type: "SignedPayload",
            senderAddress: senderPublicKeyHex,
            signature: sig,
            payload: payload
        })
            
        return this
    }
    
    unsign () {
        this.assertType("SignedPayload")
        
        const senderPublicKeyHex = this.data().senderAddress;
        const senderPublicKeyBits = sjcl.codec.hex.toBits(senderPublicKeyHex);
        
        const ok = pair.pub.verify(this.data().payload, sig);
        
        if (ok) {
            this.setData(this.data().payload);
            return true;
        }
        
        return false;
    }

    /// encrypt / unencrypt
    
    /*
        const pair = sjcl.ecc.elGamal.generateKeys(256)

        const ct = sjcl.encrypt(pair.pub, "Hello World!")
        const pt = sjcl.decrypt(pair.sec, ct)
    */

    encrypt (receiverPublicKeyHex) {
        const receiverPublicKeyBits = sjcl.codec.hex.toBits(receiverPublicKeyHex);
        //const unencryptedBits = sjcl.codec.utf8String(Object.toJsonStableString(this.data()));
        const encryptedBits = sjcl.encrypt(receiverPublicKeyBits, Object.toJsonStableString(this.data()));
        const encryptedBase64 = sjcl.codec.base64.fromBits(encryptedBits);
        
        this.setData({ 
            type: "EncryptedPayload",
            payload: encryptedBase64,
        })

        return this
    }

    unencrypt (receiverPrivateKeyHex) {
        this.assertType("EncryptedPayload")

        const receiverPrivateKeyBits = sjcl.codec.hex.toBits(receiverPrivateKeyHex)
        const encryptedBase64 = this.data().payload;
        const encryptedBits = sjcl.codec.base64.toBits(encryptedBase64)
        const decryptedBits = sjcl.decrypt(receiverPrivateKeyBits, encryptedBits)
        const decryptedString = sjcl.codec.utf8String.fromBits(encryptedBits)
        const decryptedPayloadDict = decryptedString.toJsonDict();

        if (decryptedPayloadDict === null) {
            throw new Error("can't convert decrypted payload to JSON");    
        }
        
        this.setDict(decryptedPayloadDict)
        
        return this
    }
    
    /// pow / unpow
    
    pow () {
        // data -> { type: "PowedPayload", payload: data, pow: powString }
        
        const hash = Object.toJsonStableString(this.data()).sha256String();
        const pow = this.powObject()
        pow.setHash(hash)
        pow.syncFind()
        this.setData({ type: "PowedPayload", payload: this.data(), pow: pow.powHex() })
        return true
    }
    
    asyncPow () {
        // data -> { type: "PowedPayload", payload: data, pow: powString }
        
        const hash = Object.toJsonStableString(this.data()).sha256String();
        const pow = this.powObject()
        pow.setHash(hash)
        pow.setDoneCallback(() => { this.powDone() })
        pow.asyncFind()
        return true
    }
    
    powDone () {
        this.setData({ type: "PowedPayload", payload: this.data(), pow: this.powObject().powHex() })
        if (this.donePowCallback()) {
            this.donePowCallback()()
        }  
    }
      
    unpow () {
        
        // { type: "PowedPayload", payload: data, pow: aPow } -> data
        //console.log("BMPayload.unpow this.data() = ", this.data())
        
        this.assertType("PowedPayload")
        
        console.log("unpow")

        const hash = Object.toJsonStableString(this.data().payload).sha256String();
        const pow = BMPow.clone().setHash(hash).setPowHex(this.data().pow)

        if (pow.isValid()) {
            //pow.show()
            this.setData(this.data().payload)
        } else {
            pow.show()
            this.throwError("invalid pow")
            return false
        }
        
        return pow.actualPowDifficulty()
    }
    
    actualPowDifficulty () {
        // { type: "PowedPayload", payload: data, pow: aPow } -> data
        // console.log("BMPayload.unpow this.data() = ", this.data())
        
        this.assertType("PowedPayload")

        const hash = Object.toJsonStableString(this.data().payload).sha256String();
        const pow = BMPow.clone().setHash(hash).setPowHex(this.data().pow)
        return pow.actualPowDifficulty()
    }
    
}.initThisClass()
