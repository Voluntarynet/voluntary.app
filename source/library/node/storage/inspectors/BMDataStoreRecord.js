"use strict"

/*
    
    BMDataStoreRecord
    
    A visible representation of a storage record.
    
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

    subtitle () {
        return this.key()
    }

    prepareForFirstAccess () {
        this.addSubnode(BMTextAreaField.clone().setKey("dict").setValueMethod("dictString").setValueIsEditable(false).setIsMono(true))
    }

    valuePid () {
        return this.title()
    }

    value () {
        return this.defaultStore().recordsDict().at(this.valuePid())
    }

    dictString () {
        return JSON.stringify(JSON.parse(this.value()), null, 2)
    }

    delete () {
        super.delete()
        //this.defaultStore().justRemoveObject(this.value())
        this.defaultStore().justRemovePid(this.valuePid())
        return this
    }
    
}.initThisClass()

