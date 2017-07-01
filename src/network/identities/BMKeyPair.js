var bitcore = require("bitcore-lib")
var BitcoreMessage = require('bitcore-message');
var ECIES = require('bitcore-ecies');
var Buffer = bitcore.deps.Buffer;

BMKeyPair = BMNavNode.extend().newSlots({
    type: "BMKeyPair",
    name: "",
	privateKeyString: "",
}).setSlots({
    
    _nodeVisibleClassName: "Identity",

    init: function () {
        BMNavNode.init.apply(this)
		this.generatePrivateKey()
    },

    
    title: function () {
        return this.publicKeyString()
    },
    
	isValid: function() {
		return bitcore.PrivateKey.isValid(this.privateKeyString())
	},
	
	generatePrivateKey: function() {
		var privateKey = new bitcore.PrivateKey();
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
        var signature = BitcoreMessage(msgString).sign(this.privateKey())
        return signature
    },

	encryptMessageForReceiverId: function(msgString, receiverId) {
		var encryptor = ECIES().privateKey(this.privateKey()).publicKey(receiverId.publicKey());
		var encryptedBase64String = encryptor.encrypt(msgString).toString('base64')
		return encryptedBase64String
	},
    
	decryptMessageFromSenderPublicKeyString: function(encryptedBase64String, senderPublicKeyString) {
		var encryptedBuffer = new Buffer(encryptedBase64String, 'base64')
		var senderPublicKey = new bitcore.PublicKey(senderPublicKeyString)
		var decryptor = ECIES().privateKey(this.privateKey()).publicKey(senderPublicKey);
		//console.log("encryptedMsg = '" + encryptedMsg + "'")
		var decrypted = decryptor.decrypt(encryptedBuffer).toString();
		return decrypted
	},

	equals: function(anIdentity) {
		return anIdentity != null && this.publicKeyString() == anIdentity.publicKeyString()
	},

})