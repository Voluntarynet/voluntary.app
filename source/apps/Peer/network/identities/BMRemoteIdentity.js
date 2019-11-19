"use strict"

/*

    BMRemoteIdentity
    
*/

var bitcore = require("bitcore-lib")

BMStorableNode.newSubclassNamed("BMRemoteIdentity").newSlots({
    name: "untitled",
    publicKeyString: "",
    hasPrivateKey: false,
    sessionKeys: null,
    messages: null, // TODO: remove later - no longer used
}).setSlots({
	
    _nodeVisibleClassName: "Contact",

    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)

        this.setNodeCanEditTitle(true)
        this.setNodeCanEditSubtitle(false)

        this.addStoredSlots(["name", "publicKeyString"])
		
        this.initStoredSubnodeSlotWithProto("profile", BMProfile)
        //this.initStoredSubnodeSlotWithProto("messages", BMInbox)
        //this.initStoredSubnodeSlotWithProto("sessionKeys", BMSessionKeys)
		
        //	this.messages().setTitle("messages")

        //this.setNodeColumnBackgroundColor("white")

        this.profile().fieldNamed("publicKeyString").setValueIsEditable(true)
		
        this.setCanDelete(true)
        this._didChangeIdentityNote = NotificationCenter.shared().newNote().setSender(this).setName("didChangeIdentity").setInfo(this)
    },
    
    nodeThumbnailUrl: function() {
        return this.profile().profileImageDataUrl()
    },
	
	
    postChange: function() {
        if (this._didChangeIdentityNote) {
            this._didChangeIdentityNote.post()
        }
        return this
    },
	
    localIdentity: function() {
        /*
		const localIdentity = this.parentNode().parentNode()
		assert(localIdentity.type() === "BMLocalIdentity")
		return localIdentity
		*/
        return this.parentNodeOfType("BMLocalIdentity")
    },
    
    didUpdateSlot: function(slotName, oldValue, newValue) {
        BMStorableNode.didUpdateSlot.apply(this, [slotName, oldValue, newValue])
        
        if (slotName === "publicKeyString") {
            this.postChange()
        }
        
        return this
    },

    didLoadFromStore: function() {
        BMStorableNode.didLoadFromStore.apply(this)
        //this.messages().setTitle("messages")
        //this.debugLog(" didLoadFromStore")
    },
    
    title: function () {
        if (this.name() === "") {
            return "Untitled"
        }
        return this.name()
    },

    setTitle: function (s) {
        this.setName(s)
        return this
    },

    subtitle: function() {
        if (!this.isValid()) {
            return "need to set public key"
        }
        return null
    },

    isValid: function() {
        const s = this.publicKeyString()
        return bitcore.PublicKey.isValid(s)
    },
	
    publicKey: function() {
        if (this.isValid()) {
            const s = this.publicKeyString()
            return new bitcore.PublicKey(s)
        }
        return null
    },

    verifySignatureForMessage: function(signature, msgString) {
        const address = this.publicKey().toAddress()
        const verified = Message(msgString).verify(address, signature);
        return verified
    },

    handleObjMsg: function(objMsg) {
		
        if (!objMsg.encryptedData()) {
		    return false
        }

        console.log(this.title() + " >>> " + this.typeId() + ".handleObjMsg(" + objMsg.type() + ") encryptedData:", objMsg.encryptedData())
		
        const dict = this.decryptJson(objMsg.encryptedData())
        if (dict) {
            const appMsg = BMAppMessage.fromDataDict(dict)
            //console.log("created ", appMsg.typeId())
			
            if (appMsg) {
                appMsg.setSenderId(this)
                appMsg.setReceiverId(this.localIdentity())
                appMsg.setObjMsg(objMsg)
                this.localIdentity().handleAppMsg(appMsg)
                return true
            }
        }
        return false
    },
	
    equals: function(anIdentity) {
        return anIdentity !== null && anIdentity.publicKeyString && (this.publicKeyString() === anIdentity.publicKeyString())
    },
	
    encryptJson: function(dataDict) {
        assert(dataDict)
        const encryptedData = this.localIdentity().encryptMessageForReceiverId(JSON.stringify(dataDict), this)
        assert(encryptedData)
	    // TODO: use sessionKeys
	    return encryptedData.toString()	    
    },
	
    decryptJson: function(encryptedData) {
	    // TODO: use sessionKeys
        if (this.isValid()) {
            if(!encryptedData) {
                throw new Error("encryptedData is null")
            }
            const decryptedData = this.localIdentity().decryptMessageFromSenderPublicKeyString(encryptedData, this.publicKeyString())
            if (decryptedData) {
			    return JSON.parse(decryptedData)	    
		    }
        }
	    return null
    },
	
    allIdentitiesMap: function() { // only uses valid remote identities
        const ids = ideal.Dictionary.clone()
        ids.atPut(this.publicKeyString(), this)
        return ids
    },

})
