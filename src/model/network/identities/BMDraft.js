
BMDraft = BMFieldSetNode.extend().newSlots({
    type: "BMDraft",
    status: "",
    isSent: false,
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
		this.setShouldStore(true)
		this.setShouldStoreItems(false)
        //this.setNodeRowViewClassName("BrowserFieldRow")

        this.addFieldNamed("stamp").setKey("stamp").setValueIsEditable(false)
		this.setStamp("Unstamped")
		
		this.addField(BMIdentityField.clone().setNodeFieldProperty("fromAddress").setKey("from").setValueIsEditable(false))
		this.addField(BMIdentityField.clone().setNodeFieldProperty("toAddress").setKey("to").setValueIsEditable(true))
		
        this.addFieldNamed("subject").setKey("subject")

		this.didUpdate()
	
        //this.addFieldNamed("body").setNodeMinHeight(-1).setValueDivClassName("BMTextAreaFieldValueView").setKeyIsVisible(false)
		this.addField(BMTextAreaField.clone().setKey("body").setNodeFieldProperty("body"))
        this.setStatus("")

        this.setActions(["send", "delete"])
        this.setNodeMinWidth(600)
        this.setNodeBgColor("white")
    },

	localIdentity: function() {
		if (this.drafts()) {
			return this.drafts().parentNode()
		}
		return null
	},

	setParentNode: function(aNode) {
		BMFieldSetNode.setParentNode.apply(this, [aNode])
		this.validateFromAddress()

		return this
	},    
    
    title: function() {
        var title = this.subject()
        if (!title) {
            title = "Untitled"
        }
        return title
    },
    
    subtitle: function () {
        return this.status()
    },   
    
    // ------------------------

    postDict: function() {
        var d = {}
		var payload = {}
		payload.toAddress = this.toAddress()
		payload.fromAddress = this.fromAddress()
		payload.subject = this.subject()
		payload.body = this.body()
		d.payload = d
        return d
    },
    
    
    drafts: function() {
        return this.parentNode()
    },

	validateFromAddress: function() {
		if (this.localIdentity()) {
			this.setFromAddress(this.localIdentity().publicKeyString())
		}
	},

	validateToAddress: function() {
		var addressField = this.fieldNamed("toAddress")

		if (addressField) {
			addressField.validate()
		}
		
		/*
		if (addressField) {
			if (!bitcore.PublicKey.isValid(this.toAddress())) {
				addressField.setValueError("invalid address")
			} else {
				addressField.setValueError(null)
			}
		}	
		*/
		
		return this	
	},
	
	didLoadFromStore: function() {
		this.validate()
		return this
	},
	
	validate: function() {
		this.validateToAddress()
		this.validateFromAddress()
		
		return this	
	},
	
	didUpdate: function() {
		BMFieldSetNode.didUpdate.apply(this)
		console.log("Draft update")
		this.validate()
		return this
	},
    
    send: function () {
        var objMsg = BMObjectMessage.clone()
        
        var myId = App.shared().network().localIdentities().idWithPubKeyString(this.fromAddress())        
        var toId = App.shared().network().idWithPubKeyString(this.toAddress())

        objMsg.setSenderId(myId)
        objMsg.setReceiverId(toId)
        objMsg.setContent(this.postDict())
    
        objMsg.send()
        
        var drafts = this.drafts()
        this.delete()
        // the messages object will do this?
        //drafts.localIdentity().sent().addItem(this)
    },
})
