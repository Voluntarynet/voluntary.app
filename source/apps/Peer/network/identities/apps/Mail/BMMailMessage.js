
"use strict"

/*

    BMMailMessage

*/

window.BMMailMessage = class BMMailMessage extends BMAppMessage {
    
    initPrototype () {
    }

    init () {
        super.init()

        this.addStoredField(BMOptionsNode.clone().setKey("from").setValueMethod("fromContact")).setValueIsEditable(false) //.setValidValuesMethod("fromContactNames") //.setNoteMethod("fromContactPublicKey")
        this.addStoredField(BMOptionsNode.clone().setKey("to").setValueMethod("toContact")).setValueIsEditable(true).setValidValuesMethod("toContactNames") //.setNoteMethod("toContactPublicKey")
        this.addFieldNamed("subject").setKey("subject")	

        this.addStoredField(BMTextAreaField.clone().setKey("body").setValueMethod("body"))

        this.setActions(["send"])
        this.setCanDelete(true)

        this.setNodeMinWidth(600)
        this.setNodeColumnBackgroundColor("white")
    }

    // sync

    didUpdateField (aField) {
        super.didUpdateField()

        let name = aField.valueMethod()
        //console.log("didUpdateField(" + name + ")")

        if (name === "toContact") {
            this.setupReceiverPubkeyFromInput()
            this.updateCanSend()
        }

        return this
    }

    updateCanSend () {
        if (this.canSend()) {
            this.addAction("send")
        } else {
            this.removeAction("send")
        }		
    }
	
    finalize () {
        super.finalize()
        this.setupInputsFromPubkeys()
    }
	
    loadFinalize () {
        super.loadFinalize()
        this.setupInputsFromPubkeys()
    }

    // ids

    setupReceiverPubkeyFromInput () { // called on edits
        let receiverId = App.shared().network().idWithNameOrPubkey(this.toContact())
        this.setReceiverPublicKeyString(receiverId? receiverId.publicKeyString() : null)
        return this
    }

    setupInputsFromPubkeys () { // called on load from store
        //this.debugLog(" setupInputsFromPubkeys this.senderPublicKeyString() = " + this.senderPublicKeyString())

        //if (!App.shared().network()) { return null }
        // if pubkey matches a contact name, set to name
        // otherwise, set to the pubkey

        let senderId = App.shared().network().idWithNameOrPubkey(this.senderPublicKeyString())      
        //this.debugLog(" senderId = " + senderId)
        let from = senderId ? senderId.name() : ""
        if (from !== this.fromContact()) { this.setFromContact(from) }

        let receiverId = App.shared().network().idWithNameOrPubkey(this.receiverPublicKeyString())      
        let to = receiverId ? receiverId.name() : ""
        if (to !== this.toContact()) { this.setToContact(to) }
    }

    toContactNames () {
        let localNames = App.shared().network().localIdentityNames()
        let remoteNames = this.localIdentity().remoteIdentities().names()
        return localNames.concat(remoteNames)
    }

    validateFromAddress () {
        if (this.localIdentity()) {
            this.setFromContact(this.localIdentity().name())
        }
    }

    title () {
        if (!this.localIdentityIsSender()) {
            return this.localIdentity().title()
        }
		
        let s = this.toContact()
        if (s) {
            return s
        }			
        return "No recipient"
    }

    subtitle () {
        let s = this.subject()
        if (s) {
            return s
        }
        return "No subject"
    }

    // ------------------------

    contentDict () {
        let contentDict = {}
        contentDict.subject = this.subject()
        contentDict.body = this.body()
        return contentDict
    }
	
    setContentDict (contentDict) {
		
        if (!contentDict) {
            this.setSubject("[INVALID KEY]")
            this.setBody("[INVALID KEY]")
        } else {
            this.setSubject(contentDict.subject)
            this.setBody(contentDict.body)
        }
		
        this.setupInputsFromPubkeys()
		
        return this
    }

    send () {
        super.send()
        this.delete()
    }

}.initThisClass()
