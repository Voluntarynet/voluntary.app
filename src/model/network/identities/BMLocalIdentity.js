var bitcore = require("bitcore-lib")
//var BitcoreMessage = require('bitcore-message');

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
		console.log(this.type() + " didLoadFromStore")
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
 
    subtitle: function () {
		if (this.publicKey()) {
	        return this.publicKey().toString().slice(0, 5) + "..."
		}
		return null
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
        //var bitcoreMessage = new BitcoreMessage(msgString);
        //var signature = bitcoreMessage.sign(this.privateKey());
        
       // var privateKey = bitcore.PrivateKey.fromWIF('cPBn5A4ikZvBTQ8D7NnvHZYCAxzDZ5Z2TSGW2LkyPiLxqYaJPBW4');
        //var signature = Message(msgString).sign(this.privateKey()));

        //return signature
    },

    verifySignatureForMessage: function(signature, msgString) {
        var address = this.publicKeyString()
        var verified = Message('hello, world').verify(msgString, signature);

        //var verified = new BitcoreMessage(msg).verify(this.publicKey(), signature);
        return verified
    },
})