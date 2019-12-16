"use strict"

Object.defineSlots(Date, {
    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
        const obj = this.clone()
        //obj.loadFromRecord(aRecord, aStore)
        return obj
    },

})

Object.defineSlots(Date.prototype, {

    loadFromRecord: function(aRecord, aStore) {
        this.setTime(aRecord.time)
        return this
    },

    recordForStore: function(aStore) { // should only be called by Store
        return {
            type: this.type(), 
            time: this.getTime() // toJSON is a standard library Date method
        }
    },

    shouldStore: function() {
        return true
    },

    refsPidsForJsonStore: function(puuids = new Set()) {
        return puuids
    },
})

