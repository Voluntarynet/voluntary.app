
"use strict"

/*

    BMMailMessage

*/

window.BMMailMessage = BMAppMessage.extend().newSlots({
    type: "BMMailMessage",
    //canReceive: false,
}).setSlots({
    init: function () {
        BMAppMessage.init.apply(this)

        this.addStoredField(BMOptionsField.clone().setKey("from").setValueMethod("fromContact")).setValueIsEditable(false) //.setValidValuesMethod("fromContactNames") //.setNoteMethod("fromContactPublicKey")
        this.addStoredField(BMOptionsField.clone().setKey("to").setValueMethod("toContact")).setValueIsEditable(true).setValidValuesMethod("toContactNames") //.setNoteMethod("toContactPublicKey")
        this.addFieldNamed("subject").setKey("subject")	

        this.addStoredField(BMTextAreaField.clone().setKey("body").setValueMethod("body"))

        this.setActions(["send", "delete"])
        this.setNodeMinWidth(600)
        this.setNodeColumnBackgroundColor("white")
    },

    // sync

    didUpdateField: function(aField) {
        BMFieldSetNode.didUpdateField.apply(this)

        let name = aField.valueMethod()
        //console.log("didUpdateField(" + name + ")")

        if (name === "toContact") {
            this.setupReceiverPubkeyFromInput()
            this.updateCanSend()
        }

        return this
    },

    updateCanSend: function() {
        if (this.canSend()) {
            this.addAction("send")
        } else {
            this.removeAction("send")
        }		
    },
	
    finalize: function() {
        this.setupInputsFromPubkeys()
    },
	
    loadFinalize: function() {
        this.setupInputsFromPubkeys()
    },

    // ids

    setupReceiverPubkeyFromInput: function() { // called on edits
        let receiverId = App.shared().network().idWithNameOrPubkey(this.toContact())
        this.setReceiverPublicKeyString(receiverId? receiverId.publicKeyString() : null)
        return this
    },

    setupInputsFromPubkeys: function() { // called on load from store
        //console.log(this.typeId() + " setupInputsFromPubkeys this.senderPublicKeyString() = " + this.senderPublicKeyString())

        //if (!App.shared().network()) { return null }
        // if pubkey matches a contact name, set to name
        // otherwise, set to the pubkey

        let senderId = App.shared().network().idWithNameOrPubkey(this.senderPublicKeyString())      
        //console.log(this.typeId() + " senderId = " + senderId)
        let from = senderId ? senderId.name() : ""
        if (from != this.fromContact()) { this.setFromContact(from) }

        let receiverId = App.shared().network().idWithNameOrPubkey(this.receiverPublicKeyString())      
        let to = receiverId ? receiverId.name() : ""
        if (to != this.toContact()) { this.setToContact(to) }
    },

    toContactNames: function() {
        let localNames = App.shared().network().localIdentityNames()
        let remoteNames = this.localIdentity().remoteIdentities().names()
        return localNames.concat(remoteNames)
    },

    validateFromAddress: function() {
        if (this.localIdentity()) {
            this.setFromContact(this.localIdentity().name())
        }
    },

    title: function() {
        if (!this.localIdentityIsSender()) {
            return this.localIdentity().title()
        }
		
        let s = this.toContact()
        if (s) {
            return s
        }			
        return "No recipient"
    },

    subtitle: function () {
        let s = this.subject()
        if (s) {
            return s
        }
        return "No subject"
    },   

    // ------------------------

    contentDict: function() {
        let contentDict = {}
        contentDict.subject = this.subject()
        contentDict.body = this.body()
        return contentDict
    },
	
    setContentDict: function(contentDict) {
		
        if (!contentDict) {
            this.setSubject("[INVALID KEY]")
            this.setBody("[INVALID KEY]")
        } else {
            this.setSubject(contentDict.subject)
            this.setBody(contentDict.body)
        }
		
        this.setupInputsFromPubkeys()
		
        return this
    },

    send: function () {
        BMAppMessage.send.apply(this)
        this.delete()
    },
})
