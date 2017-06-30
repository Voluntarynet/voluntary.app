var bitcore = require("bitcore-lib")
var BitcoreMessage = require('bitcore-message');
var ECIES = require('bitcore-ecies');
var Buffer = bitcore.deps.Buffer;

BMLocalIdentity = BMNavNode.extend().newSlots({
    type: "BMLocalIdentity",
    name: "",
	privateKeyString: "",
}).setSlots({
    
    _nodeVisibleClassName: "Identity",

    init: function () {
        BMNavNode.init.apply(this)
		this.setShouldStore(true)
        this.setNodeTitleIsEditable(true)
 

        this.initStoredSlotWithProto("apps", BMApps)
        this.initStoredSlotWithProto("profile", BMProfile)
        
		this.addStoredSlots(["name", "privateKeyString"])
		
        this.setName("Untitled")
        this.addAction("delete")

		this.profile().fieldNamed("publicKeyString").setValueIsEditable(false)
		//console.log("is editable = ", this.profile().fieldNamed("publicKeyString").valueIsEditable())
		this.generatePrivateKey()
    },

	didLoadFromStore: function() {
		//console.log(this.type() + " didLoadFromStore")
		BMNavNode.didLoadFromStore.apply(this)
		this.profile().fieldNamed("publicKeyString").setValueIsEditable(false)
	},

    
    title: function () {
        return this.name()
    },
    
    setTitle: function (s) {
        this.setName(s)
        return this
    },
 
/*
    subtitle: function () {
		if (this.publicKey()) {
	        return this.publicKey().toString().slice(0, 5) + "..."
		}
		return null
    },  
    */
    
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
	
	handleMessage: function(msg) {	
		this.apps().handleMessage(msg)
		return this
	},
	
	equals: function(anIdentity) {
		return anIdentity != null && this.publicKeyString() == anIdentity.publicKeyString()
	},

})