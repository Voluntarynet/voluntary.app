
"use strict"

/*

    BMBlacklistEntry

*/

window.BMBlacklistEntry = BMFieldSetNode.extend().newSlots({
    type: "BMBlacklistEntry",
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)		
        this.setTitle("Blacklist entry")
        this.setShouldStore(true)

        this.addFieldNamed("host").setValueMethod("host").setValueIsEditable(true).setValue("host")
        this.addFieldNamed("reason").setValueMethod("reason").setValueIsEditable(true).setValue("")
        //this.addFieldNamed("creationDate").setValueMethod("creationDate").setValueIsEditable(false).setValue("")
        //this.addFieldNamed("expirationDate").setValueMethod("expirationDate").setValueIsEditable(false).setValue("")
		
	    this.addAction("delete")
    },
    
    title: function() {
        return this.fieldNamed("host").value()  
    },
    
    subtitle: function() {
        return this.fieldNamed("reason").value()  
    },
	
})
