"use strict"

/*
    
    BMDataStoreRecord
    
    A visible representation of the NodeStore object record.
    
*/

window.BMDataStoreRecord = class BMDataStoreRecord extends BMFieldSetNode {
    
    initPrototype () {
        this.newSlots({
            key: null,
            didSetupFields: false,
        })
    }

    init () {
        super.init()
        //this.setCanDelete(true) // not safe for non-developers
        this.setNodeColumnBackgroundColor("white")
        this.setNodeMinWidth(300)
    }

    prepareForFirstAccess () {
        this.addStoredField(BMTextAreaField.clone().setKey("dict").setValueMethod("dictString").setValueIsEditable(false).setIsMono(true))
    }

    valuePid  () {
        return this.title()
    }

    value  () {
        return this.defaultStore().sdb().at(this.valuePid())
    }

    dictString  () {
        return JSON.stringify(JSON.parse(this.value()), null, 2)
    }

    delete  () {
        super.delete()
        //this.defaultStore().justRemoveObject(this.value())
        this.defaultStore().justRemovePid(this.valuePid())
        return this
    }
    
}.initThisClass()

