var bitcore = require("bitcore-lib")
var BitcoreMessage = require("bitcore-message");
var ECIES = require("bitcore-ecies");
var Buffer = bitcore.deps.Buffer;

"use strict"

/*

    BMLocalIdentity
    
*/

window.BMLocalIdentity = class BMLocalIdentity extends BMKeyPair {
    
    initPrototype () {
        this.overrideSlot("name", "").setShouldStoreSlot(true)
        this.overrideSlot("privateKeyString", "").setShouldStoreSlot(true)
        this.newSlot("didChangeIdentityNote", null)

        this.newSlot("apps", null).setShouldStoreSlot(true).setInitProto(BMApps)
        this.newSlot("profile", null).setShouldStoreSlot(true).setInitProto(BMProfile)
        this.newSlot("remoteIdentities", null).setShouldStoreSlot(true).setInitProto(BMRemoteIdentities)

        this.setShouldStore(true)
    }

    init () {
        super.init()
        //this.setShouldStoreSubnodes(false)
        this.setNodeCanEditTitle(true)
 
        /*
        this.initStoredSubnodeSlotWithProto("apps", BMApps)
        this.initStoredSubnodeSlotWithProto("profile", BMProfile)
        this.initStoredSubnodeSlotWithProto("remoteIdentities", BMRemoteIdentities)
        */
        
        this.setCanDelete(true)

        this.setName("Untitled")

        this.profile().fieldNamed("publicKeyString").setValueIsEditable(false)
        //console.log("is editable = ", this.profile().fieldNamed("publicKeyString").valueIsEditable())
        this.generatePrivateKey()
        this.setCanDelete(true)
        this.setDidChangeIdentityNote(NotificationCenter.shared().newNote().setSender(this).setName("didChangeIdentity"))

        this.setNodeCanEditTitle(true)
    }
    
    didUpdateSubnode (aSubnode) {
        this.postDidChangeIdentity()
        return this
    }
    
    postDidChangeIdentity () {
        this.didChangeIdentityNote().post()
        return this
    }

    finalize () {
        super.finalize()
        //this.debugLog(".finalize()")
        this.postDidChangeIdentity()
    }
	
    didLoadFromStore () {
        //this.debugLog(" didLoadFromStore")
        super.didLoadFromStore()
        this.profile().fieldNamed("publicKeyString").setValueIsEditable(false)
    }
    
    title () {
        return this.name()
    }
    
    setTitle (s) {
        this.setName(s)
        return this
    }
 
    handleObjMsg (objMsg) {
        //this.debugLog(" " + this.name() + " handleObjMsg ", objMsg)
        const senderId = this.remoteIdentities().idWithPublicKeyString(objMsg.senderPublicKeyString()) 
        let didHandle = false
		
        if (senderId) {
            // give the remote id a chance to decrypt it with local private key + remote pubkey
            didHandle |= senderId.handleObjMsg(objMsg)
        }
        
        if (objMsg.data()) {
            // it's a clear text message
            didHandle |= this.handleCleartextObjMsg(objMsg)
        }
        
        return false
    }
    
    handleCleartextObjMsg (objMsg) {
        console.log(this.title() + " >>>>>> " + this.typeId() + ".handleCleartextObjMsg(" + objMsg.type() + ") encryptedData:", objMsg.encryptedData(), " data:", objMsg.data())
		
        const dict = objMsg.data()
        if (dict) {
            const appMsg = BMAppMessage.fromDataDict(dict)
            //console.log("created ", appMsg.typeId())
			
            if (appMsg) {
			    const senderId = this.idForPublicKeyString(objMsg.senderPublicKeyString())
                appMsg.setSenderId(senderId)
                appMsg.setObjMsg(objMsg)
                this.handleAppMsg(appMsg)
                return true
            }
        }
        return false
    }
	

    handleAppMsg (appMsg) {	
        return this.apps().handleAppMsg(appMsg)
    }
	
    idForPublicKeyString (pk) {
	    return this.allIdentitiesMap().at(pk)
    }
	
    allIdentitiesMap () { // only uses valid remote identities
        const ids = ideal.Dictionary.clone()
        ids.atPut(this.publicKeyString(), this)
		
        this.remoteIdentities().subnodes().forEach((rid) => { 
		    ids.merge(rid.allIdentitiesMap())
        })
		
        this.apps().subnodes().forEach((app) => { 
            //console.log("App.shared().type() = ", App.shared().type())
		    ids.merge(app.allIdentitiesMap())
        })
		
        return ids
    }
	
    shelfSubnodes () {    
        const chat = this.apps().appNamed("Chat")

        const feed     = chat.feedPosts()
        const posts    = chat.myPosts()
        const threads  = chat.threads()
        const profile = this.profile()
        const contacts = this.remoteIdentities()
        const drafts   = chat.drafts()
        
        return [feed, posts, threads, profile, contacts, drafts]
    }
    
    
    nodeThumbnailUrl () {
        //return this.profile().profileImageDataUrl()
        return null
    }
        
}.initThisClass()