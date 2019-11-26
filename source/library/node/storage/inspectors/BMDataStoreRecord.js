"use strict"

/*
    
    BMDataStoreRecord
    
    A visible representation of the NodeStore object record.
    
*/

BMFieldSetNode.newSubclassNamed("BMDataStoreRecord").newSlots({
    key: null,
    didSetupFields: false,
}).setSlots({
    init: function () {
        BMFieldSetNode.init.apply(this)
        //this.setCanDelete(true) // not safe for non-developers
        this.setNodeColumnBackgroundColor("white")
        this.setNodeMinWidth(300)
    },

    prepareForFirstAccess: function() {
        this.addStoredField(BMTextAreaField.clone().setKey("dict").setValueMethod("dictString").setValueIsEditable(false).setIsMono(true))
    },

    valuePid: function () {
        return this.title()
    },

    value: function () {
        return this.defaultStore().sdb().at(this.valuePid())
    },

    dictString: function () {
        return JSON.stringify(JSON.parse(this.value()), null, 2)
    },

    delete: function () {
        BMFieldSetNode.delete.apply(this)
        //this.defaultStore().justRemoveObject(this.value())
        this.defaultStore().justRemovePid(this.valuePid())
        return this
    },
    
}).initThisProto()

