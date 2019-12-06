"use strict"

/*
    
    BMDataStoreRecord
    
    A visible representation of a storage record.
    
*/

window.BMDataStoreRecord = class BMDataStoreRecord extends BMFieldSetNode {
    
    initPrototype () {
        this.newSlot("key", null)
        this.newSlot("store", null)
    }

    init () {
        super.init()
        this.setCanDelete(false) // not safe for non-developers
        this.setNodeColumnBackgroundColor("white")
        this.setNodeMinWidth(600)
    }

    prepareForFirstAccess () {
        this.addField(BMTextAreaField.clone().setKey("dict").setValueMethod("dictString").setValueIsEditable(false).setIsMono(true))
    }

    record () {
        return this.store().recordForPid(this.key())
    }

    dictString () {
        return JSON.stringify(this.record(), null, 2)
    }

    delete () {
        super.delete()
        //this.defaultStore().justRemoveObject(this.value())
        this.defaultStore().justRemovePid(this.key())
        return this
    }
    
}.initThisClass()

