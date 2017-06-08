
BMBlacklistEntry = BMFieldSetNode.extend().newSlots({
    type: "BMBlacklistEntry",
    /*
    ip: "",
    creationDate: "",
    expirationDate: "",
    reason: "",
    */
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)		
        this.setTitle("Blacklist entry")
        this.setNodeMinWidth(150)
        
        /*
		this.addStoredSlot("ip")
		this.addStoredSlot("creationDate")
		this.addStoredSlot("expirationDate")
		this.addStoredSlot("reason")
		*/
		
		this.addFieldNamed("host").setNodeFieldProperty("host").setValueIsEditable(true)
		this.addFieldNamed("reason").setNodeFieldProperty("reason").setValueIsEditable(true)
		this.addFieldNamed("creationDate").setNodeFieldProperty("creationDate").setValueIsEditable(false)
		this.addFieldNamed("expirationDate").setNodeFieldProperty("expirationDate").setValueIsEditable(false)
	    this.addAction("delete")
    },
    
    title: function() {
        return this.fieldNamed("host").value()  
    },
    
    subtitle: function() {
        return this.fieldNamed("reason").value()  
    },
	
})
