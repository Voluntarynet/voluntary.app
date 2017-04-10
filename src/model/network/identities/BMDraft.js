
BMDraft = BMFormNode.extend().newSlots({
    type: "BMDraft",
    status: "",
    isSent: false,
}).setSlots({
    init: function () {
        BMFormNode.init.apply(this)
		this.setShouldStore(true)
        //this.setNodeRowViewClassName("BrowserFieldRow")

        this.addFieldNamed("from").setNodeTitleIsEditable(false)
        this.addFieldNamed("to")
        this.addFieldNamed("subject")
        this.addFieldNamed("body").setNodeMinHeight(-1).setNodeRowViewClassName("BrowserAreaRow")

        this.setStatus("")

        this.setActions(["send", "delete"])
        this.setNodeMinWidth(600)
        this.setNodeBgColor("white")
    },
    
    
    title: function() {
        var title = this.valueForFieldNamed("subject")
        if (title.length == 0) {
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
    
    fromValue: function() {
        return this.valueForFieldNamed("from")
    },
    
    toValue: function() {
        return this.valueForFieldNamed("to")
    },

	body: function() {
        return this.valueForFieldNamed("body")
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
