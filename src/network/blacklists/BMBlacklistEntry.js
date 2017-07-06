
BMBlacklistEntry = BMFieldSetNode.extend().newSlots({
    type: "BMBlacklistEntry",
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)		
        this.setTitle("Blacklist entry")
        this.setShouldStore(true)
        this.setNodeMinWidth(150)

		this.addFieldNamed("host").setNodeValueMethod("host").setValueIsEditable(true).setValue("host")
		this.addFieldNamed("reason").setNodeValueMethod("reason").setValueIsEditable(true).setValue("")
		//this.addFieldNamed("creationDate").setNodeValueMethod("creationDate").setValueIsEditable(false).setValue("")
		//this.addFieldNamed("expirationDate").setNodeValueMethod("expirationDate").setValueIsEditable(false).setValue("")
		
	    this.addAction("delete")
    },
    
    title: function() {
        return this.fieldNamed("host").value()  
    },
    
    subtitle: function() {
        return this.fieldNamed("reason").value()  
    },
	
})
