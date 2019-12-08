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
        this.setCanDelete(false) // too dangerous
        this.setNodeColumnBackgroundColor("white")
        this.setNodeMinWidth(600)
    }

    prepareForFirstAccess () {
        this.addField(BMTextAreaField.clone().setKey("recordString").setValueMethod("recordString").setValueIsEditable(false).setIsMono(true))
    }

    record () {
        return this.store().recordForPid(this.key())
    }

    setRecordString (s) {
        throw new Error("not editable")
    }

    recordString () {
        return JSON.stringify(this.record(), null, 2)
    }

    /*
    delete () {
        super.delete()
        this.defaultStore().justRemovePid(this.key())
        return this
    }
    */
    
}.initThisClass()

