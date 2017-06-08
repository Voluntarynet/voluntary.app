var bitcore = require("bitcore-lib")
//var BitcoreMessage = require('bitcore-message');
var ECIES = require('bitcore-ecies');
var Buffer = bitcore.deps.Buffer;

BMPrivateKey = BMNode.extend().newSlots({
    type: "BMPrivateKey",
	privateKeyString: "",
}).setSlots({
    
    _nodeVisibleClassName: "Private Key",

    init: function () {
        BMNode.init.apply(this)
		this.setShouldStore(false)
        this.setNodeTitleIsEditable(true)
        
		this.addStoredSlots(["name", "privateKeyString"])
		
        this.setName("Untitled")
        this.addAction("delete")

		this.profile().fieldNamed("publicKeyString").setValueIsEditable(false)
		//console.log("is editable = ", this.profile().fieldNamed("publicKeyString").valueIsEditable())
		this.generatePrivateKey()
    },
    
    title: function () {
        return "Private Key"
    },
    
    subtitle: function () {
        return "for " + this.publicKeyString()
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
        var signature = Message(msgString).sign(this.privateKey())
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
	
	equals: function(other) {
		return this.publicKeyString() == other.publicKeyString()
	},

})