
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

        this.addFieldNamed("fromAddress").setKey("from")
        this.addFieldNamed("toAddress").setKey("to")
        this.addFieldNamed("subject").setKey("subject")
        //this.addFieldNamed("body").setNodeMinHeight(-1).setValueDivClassName("BMTextAreaFieldValueView").setKeyIsVisible(false)
		this.addField(BMTextAreaField.clone().setKey("body").setNodeFieldProperty("body"))
        this.setStatus("")

        this.setActions(["send", "delete"])
        this.setNodeMinWidth(600)
        this.setNodeBgColor("white")
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
        var d = this.nodeDict()
        delete d.type
        delete d.children
        //console.log("postDict: ", d)
        return d
    },
    
    
    drafts: function() {
        return this.parentNode()
    },
    
    send: function () {
        var objMsg = BMObjectMessage.clone()
        
        var myId = App.shared().network().localIdentities().idWithPubKeyString(this.fromValue())        
        var toId = App.shared().network().idWithPubKeyString(this.toValue())

        objMsg.setSenderId(myId)
        objMsg.setReceiverId(myId)
        objMsg.setContent(this.postDict())
    
        objMsg.send()
        
        var drafts = this.drafts()
        this.delete()
        // the messages object will do this?
        //drafts.localIdentity().sent().addItem(this)
    },
})
