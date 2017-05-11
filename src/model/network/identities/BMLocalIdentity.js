var bitcore = require("bitcore-lib")
//var BitcoreMessage = require('bitcore-message');
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
 
        this.initStoredSlotWithProto("profile", BMProfile)
        this.initStoredSlotWithProto("inbox", BMInbox)
        this.initStoredSlotWithProto("drafts", BMDrafts)
        this.initStoredSlotWithProto("sent", BMSent)
        
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
	
	fileMessage: function(msg) {
		ShowStack()
		
		if (this.equals(msg.senderId())) {
			console.log("LocalIdentity 1 fileMessage from " + msg.senderId().name() + " to " + msg.receiverId().name() + " into " + this.name() + " inbox")
			console.log("LocalIdentity 2 aPrivateMsg.senderId().name() = ",  msg.senderId().name())
			this.sent().addItemIfAbsent(msg)
			console.log("LocalIdentity 3 aPrivateMsg.senderId().name() = ",  msg.senderId().name())
		}
		
		if (this.equals(msg.receiverId())) {
			console.log("LocalIdentity 11 fileMessage from " + msg.senderId().name() + " to " + msg.receiverId().name() + " into " + this.name() + " inbox")
			var senderName1 = msg.senderId().name()
			console.log("LocalIdentity 22 aPrivateMsg.senderId().name() = ",  msg.senderId().name())
			console.log("msg1 = ", msg.postDict())
			
			//this.inbox().addItemIfAbsent(msg)
			this.inbox().addItem(msg)
			
			console.log("msg2 = ", msg.postDict())
			var senderName2 = msg.senderId().name()
			if (senderName1 != senderName2) {
				throw new Error(senderName1 + " != " + senderName2)
			}
			console.log("LocalIdentity 33 aPrivateMsg.senderId().name() = ",  msg.senderId().name())
		}
		
		return this
	},
	
	equals: function(anIdentity) {
		return this.publicKeyString() == anIdentity.publicKeyString()
	},

})