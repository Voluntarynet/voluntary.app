var bitcore = require("bitcore-lib")
var BitcoreMessage = require("bitcore-message");
var ECIES = require("bitcore-ecies");
var Buffer = bitcore.deps.Buffer;

"use strict"

/*

    BMKeyPair
    
*/

window.BMKeyPair = class BMKeyPair extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("name", "")
        this.newSlot("privateKeyString", "")
        this.newSlot("hasPrivateKey", true)
    }

    init () {
        super.init()
        this.generatePrivateKey()
    }
    
    title () {
        return this.publicKeyString()
    }
    
    isValid () {
        return bitcore.PrivateKey.isValid(this.privateKeyString())
    }
	
    generatePrivateKey () {
        const privateKey = new bitcore.PrivateKey();
        this.setPrivateKeyString(privateKey.toString())
        return this
    }
    
    privateKey () {
        if (this.isValid()) { 
            return bitcore.PrivateKey.fromString(this.privateKeyString())
        }
        
        return null
    }

    publicKey () {
        if (this.privateKey()) {
	        return this.privateKey().toPublicKey()
        }
        return null
    }

    publicKeyString () {
        if (this.publicKey()) {
	        return this.publicKey().toString()
        }
        return null
    }

    signatureForMessageString (msgString) {
        const signature = BitcoreMessage(msgString).sign(this.privateKey())
        return signature
    }

    encryptMessageForReceiverId (msgString, receiverId) {
        const encryptor = ECIES().privateKey(this.privateKey()).publicKey(receiverId.publicKey());
        const encryptedBase64String = encryptor.encrypt(msgString).toString("base64")
        return encryptedBase64String
    }
    
    decryptMessageFromSenderPublicKeyString (encryptedBase64String, senderPublicKeyString) {
        const encryptedBuffer = new Buffer(encryptedBase64String, "base64")
        //console.log("senderPublicKeyString = ", senderPublicKeyString)
        const senderPublicKey = new bitcore.PublicKey(senderPublicKeyString)
        const decryptor = ECIES().privateKey(this.privateKey()).publicKey(senderPublicKey);
        //console.log("encryptedMsg = '" + encryptedMsg + "'")
        let decrypted = null
        try {
    		decrypted = decryptor.decrypt(encryptedBuffer).toString();
        } catch(e) {
            
        }
        return decrypted
    }

    equals (anIdentity) {
        return anIdentity !== null && this.publicKeyString() === anIdentity.publicKeyString()
    }

}.initThisClass()