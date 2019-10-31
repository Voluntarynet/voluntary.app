var bitcore = require("bitcore-lib")
var BitcoreMessage = require("bitcore-message");
var ECIES = require("bitcore-ecies");
var Buffer = bitcore.deps.Buffer;

"use strict"

/*

    BMKeyPair
    
*/

BMStorableNode.newSubclassNamed("BMKeyPair").newSlots({
    name: "",
    privateKeyString: "",
    hasPrivateKey: true,
}).setSlots({
    
    init: function () {
        BMStorableNode.init.apply(this)
        this.generatePrivateKey()
    },

    
    title: function () {
        return this.publicKeyString()
    },
    
    isValid: function() {
        return bitcore.PrivateKey.isValid(this.privateKeyString())
    },
	
    generatePrivateKey: function() {
        const privateKey = new bitcore.PrivateKey();
        this.setPrivateKeyString(privateKey.toString())
        return this
    },
    
    privateKey: function() {
        if (this.isValid()) { 
            return bitcore.PrivateKey.fromString(this.privateKeyString())
        }
        
        return null
    },

    publicKey: function () {
        if (this.privateKey()) {
	        return this.privateKey().toPublicKey()
        }
        return null
    },

    publicKeyString: function () {
        if (this.publicKey()) {
	        return this.publicKey().toString()
        }
        return null
    },

    signatureForMessageString: function(msgString) {
        const signature = BitcoreMessage(msgString).sign(this.privateKey())
        return signature
    },

    encryptMessageForReceiverId: function(msgString, receiverId) {
        const encryptor = ECIES().privateKey(this.privateKey()).publicKey(receiverId.publicKey());
        const encryptedBase64String = encryptor.encrypt(msgString).toString("base64")
        return encryptedBase64String
    },
    
    decryptMessageFromSenderPublicKeyString: function(encryptedBase64String, senderPublicKeyString) {
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
    },

    equals: function(anIdentity) {
        return anIdentity !== null && this.publicKeyString() === anIdentity.publicKeyString()
    },

})