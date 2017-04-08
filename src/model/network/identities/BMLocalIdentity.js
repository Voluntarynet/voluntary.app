var bitcore = require("bitcore-lib")
//var BitcoreMessage = require('bitcore-message');

BMLocalIdentity = BMNavNode.extend().newSlots({
    type: "BMLocalIdentity",
    name: null,
    keyPair: null,
    
    profile: null,
    drafts: null,
    inbox: null,
    sent: null,
    
}).setSlots({
    
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
    },
    
    title: function () {
        return this.name()
    },
    
    setTitle: function (s) {
        this.setName(s)
        var self = this
        setTimeout(function () { 
            self.didUpdate() 
            //self.markDirty()
        }, 10)
        return this
    },
 
    subtitle: function () {
        return this.address()
    },  
    
    /*
    setSubtitle: function (s) {
        return this.setAddress(s)
    }, 
    */
    
    privateKeyString: function () {
        /*
        if (!this.privateKey()) { 
            return null 
        }
        */
        return this.privateKey().toString()
    },
    
    setPrivateKeyString: function(s) {
        if (s) {
            this._privateKey = bitcore.PrivateKey.fromString(s)
        }
        
        return this
    },
    
    /*
    setName: function(v) {
        this._name = v
        this.profile().setTitle(v)
        return this
    },
    */
    
    setPrivateKey: function(pk) {
        this._privateKey = pk
        //this.profile().setSubtitle(this.publicKeyString())
        return this
    },
    
    privateKey: function () {
        if (!this._privateKey) {
            this.setPrivateKey(new bitcore.PrivateKey())
        }
        return this._privateKey
    },
    
    publicKey: function () {
        // PublicKey.isValid()
        return this.privateKey().toPublicKey()
    },
    
    publicKeyString: function () {
        return this.publicKey().toString()
    },
    
    address: function() {
        return this.publicKey().toString().slice(0, 12) + "..."
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