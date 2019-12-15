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
        const jsonField = BMTextAreaField.clone().setKey("recordString")
        jsonField.setValueMethod("recordString").setValueIsEditable(false).setIsMono(true)
        this.addField(jsonField)

        this.referencedRecords().forEach((aRecord) => {
            const node = BMDataStoreRecord.forRecord(aRecord)
            this.addSubnode(node)
        })
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

    referencedRecords () {
        return this.referencedPidSet().map( pid => this.defaultStore().recordForPid(pid) )
    }

    referencedPidSet () {
        return this.defaultStore().refSetForPuuid(this.record().id)
    }

    /*
    delete () {
        super.delete()
        this.defaultStore().justRemovePid(this.key())
        return this
    }
    */

    static forRecord (aRecord) {
        const subnode = BMDataStoreRecord.clone()
        subnode.setTitle(aRecord.type + " " + aRecord.id)
        //subnode.setTitle(aRecord.id)
        subnode.setKey(aRecord.id)
        subnode.setStore(this.defaultStore()) //// <-------------------- avoid this?
        const size = JSON.stringify(aRecord).length
        const sizeDescription = ByteFormatter.clone().setValue(size).formattedValue()
        subnode.setSubtitle(sizeDescription)
        return subnode
    }
    
}.initThisClass()

