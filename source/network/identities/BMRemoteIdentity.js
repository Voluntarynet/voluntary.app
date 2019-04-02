"use strict"

/*

    BMRemoteIdentity
    
*/

var bitcore = require("bitcore-lib")

window.BMRemoteIdentity = BMStorableNode.extend().newSlots({
    type: "BMRemoteIdentity",
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

        this.setNodeTitleIsEditable(true)
        this.setNodeSubtitleIsEditable(false)

        this.addStoredSlots(["name", "publicKeyString"])
		
        this.initStoredSubnodeSlotWithProto("profile", BMProfile)
        //this.initStoredSubnodeSlotWithProto("messages", BMInbox)
        //this.initStoredSubnodeSlotWithProto("sessionKeys", BMSessionKeys)
		
        //	this.messages().setTitle("messages")

        //this.setNodeColumnBackgroundColor("white")

        this.profile().fieldNamed("publicKeyString").setValueIsEditable(true)
		
        this.addAction("delete")
        this._didChangeIdentityNote = NotificationCenter.shared().newNote().setSender(this.uniqueId()).setName("didChangeIdentity").setInfo(this)
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
		let localIdentity = this.parentNode().parentNode()
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
        //console.log(this.typeId() + " didLoadFromStore")
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
        let s = this.publicKeyString()
        return bitcore.PublicKey.isValid(s)
    },
	
    publicKey: function() {
        if (this.isValid()) {
            let s = this.publicKeyString()
            return new bitcore.PublicKey(s)
        }
        return null
    },

    verifySignatureForMessage: function(signature, msgString) {
        let address = this.publicKey().toAddress()
        let verified = Message(msgString).verify(address, signature);
        return verified
    },

    handleObjMsg: function(objMsg) {
		
        if (!objMsg.encryptedData()) {
		    return false
        }

        console.log(this.title() + " >>> " + this.typeId() + ".handleObjMsg(" + objMsg.type() + ") encryptedData:", objMsg.encryptedData())
		
        let dict = this.decryptJson(objMsg.encryptedData())
        if (dict) {
            let appMsg = BMAppMessage.fromDataDict(dict)
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
        let encryptedData = this.localIdentity().encryptMessageForReceiverId(JSON.stringify(dataDict), this)
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
            let decryptedData = this.localIdentity().decryptMessageFromSenderPublicKeyString(encryptedData, this.publicKeyString())
            if (decryptedData) {
			    return JSON.parse(decryptedData)	    
		    }
        }
	    return null
    },
	
    allIdentitiesMap: function() { // only uses valid remote identities
        let ids = ideal.Map.clone()
        ids.atPut(this.publicKeyString(), this)
        return ids
    },

})
