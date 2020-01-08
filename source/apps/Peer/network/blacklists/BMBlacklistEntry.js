
"use strict"

/*

    BMBlacklistEntry

*/

window.BMBlacklistEntry = class BMBlacklistEntry extends BMFieldSetNode {
    
    initPrototype () {

    }

    init () {
        super.init()	
        this.setTitle("Blacklist entry")
        this.setShouldStore(true)

        this.addFieldNamed("host").setValueMethod("host").setValueIsEditable(true).setValue("host")
        this.addFieldNamed("reason").setValueMethod("reason").setValueIsEditable(true).setValue("")
        //this.addFieldNamed("creationDate").setValueMethod("creationDate").setValueIsEditable(false).setValue("")
        //this.addFieldNamed("expirationDate").setValueMethod("expirationDate").setValueIsEditable(false).setValue("")
		
        this.setCanDelete(true)
    }
    
    title () {
        return this.fieldNamed("host").value()  
    }
    
    subtitle () {
        return this.fieldNamed("reason").value()  
    }
	
}.initThisClass()
