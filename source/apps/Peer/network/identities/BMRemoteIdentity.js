"use strict"

/*

    BMRemoteIdentity
    
*/

var bitcore = require("bitcore-lib")

window.BMRemoteIdentity = class BMRemoteIdentity extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("name", "untitled").setShouldStoreSlot(true)
        this.newSlot("publicKeyString", "").setShouldStoreSlot(true)

        this.newSlot("hasPrivateKey", false)
        this.newSlot("sessionKeys", null)
        this.newSlot("messages", null)  // TODO: remove later - no longer used
    }

    init () {
        super.init()

        this.setNodeVisibleClassName("Contact")

        this.setShouldStore(true)
        this.setNodeCanEditTitle(true)
        this.setNodeCanEditSubtitle(false)
		
        this.initStoredSubnodeSlotWithProto("profile", BMProfile)
        //this.initStoredSubnodeSlotWithProto("messages", BMInbox)
        //this.initStoredSubnodeSlotWithProto("sessionKeys", BMSessionKeys)
		
        //	this.messages().setTitle("messages")

        //this.setNodeColumnBackgroundColor("white")

        this.profile().fieldNamed("publicKeyString").setValueIsEditable(true)
		
        this.setCanDelete(true)
        this._didChangeIdentityNote = NotificationCenter.shared().newNote().setSender(this).setName("didChangeIdentity").setInfo(this)
    }
    
    nodeThumbnailUrl () {
        return this.profile().profileImageDataUrl()
    }
	
	
    postChange () {
        if (this._didChangeIdentityNote) {
            this._didChangeIdentityNote.post()
        }
        return this
    }
	
    localIdentity () {
        /*
		const localIdentity = this.parentNode().parentNode()
		assert(localIdentity.type() === "BMLocalIdentity")
		return localIdentity
		*/
        return this.parentNodeOfType("BMLocalIdentity")
    }

    didUpdateSlotPublicKeyString (oldValue, newValue) {
        this.postChange()
    }

    didLoadFromStore () {
        super.didLoadFromStore()
        //this.messages().setTitle("messages")
        //this.debugLog(" didLoadFromStore")
    }
    
    title () {
        if (this.name() === "") {
            return "Untitled"
        }
        return this.name()
    }

    setTitle (s) {
        this.setName(s)
        return this
    }

    subtitle () {
        if (!this.isValid()) {
            return "need to set public key"
        }
        return null
    }

    isValid () {
        const s = this.publicKeyString()
        return bitcore.PublicKey.isValid(s)
    }
	
    publicKey () {
        if (this.isValid()) {
            const s = this.publicKeyString()
            return new bitcore.PublicKey(s)
        }
        return null
    }

    verifySignatureForMessage (signature, msgString) {
        const address = this.publicKey().toAddress()
        const verified = Message(msgString).verify(address, signature);
        return verified
    }

    handleObjMsg (objMsg) {
		
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
    }
	
    equals (anIdentity) {
        return anIdentity !== null && anIdentity.publicKeyString && (this.publicKeyString() === anIdentity.publicKeyString())
    }
	
    encryptJson (dataDict) {
        assert(dataDict)
        const encryptedData = this.localIdentity().encryptMessageForReceiverId(JSON.stringify(dataDict), this)
        assert(encryptedData)
	    // TODO: use sessionKeys
	    return encryptedData.toString()	    
    }
	
    decryptJson (encryptedData) {
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
    }
	
    allIdentitiesMap () { // only uses valid remote identities
        const ids = ideal.Dictionary.clone()
        ids.atPut(this.publicKeyString(), this)
        return ids
    }

}.initThisClass()
