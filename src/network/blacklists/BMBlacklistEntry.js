
BMBlacklistEntry = BMFieldSetNode.extend().newSlots({
    type: "BMBlacklistEntry",
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)		
        this.setTitle("Blacklist entry")
        this.setShouldStore(true)
        this.setNodeMinWidth(150)

		this.addFieldNamed("host").setNodeFieldProperty("host").setValueIsEditable(true).setValue("host")
		this.addFieldNamed("reason").setNodeFieldProperty("reason").setValueIsEditable(true).setValue("")
		this.addFieldNamed("creationDate").setNodeFieldProperty("creationDate").setValueIsEditable(false).setValue("")
		this.addFieldNamed("expirationDate").setNodeFieldProperty("expirationDate").setValueIsEditable(false).setValue("")
		
	    this.addAction("delete")
    },
    
    title: function() {
        return this.fieldNamed("host").value()  
    },
    
    subtitle: function() {
        return this.fieldNamed("reason").value()  
    },
	
})
