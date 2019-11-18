"use strict"

Object.defineSlots(Date.prototype, {
    recordForStore: function(aStore) { // should only be called by Store
        return {
            type: "Date", 
            v: this.toJSON() // toJSON is a standard library Date method
        }
    },

    shouldStore: function() {
        return true
    },

    storeJsonRefs: function(puuids = new Set()) {
        return puuids
    },
})

Object.defineSlots(Date, {
    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
        assert(aRecord.type === "Date")
        return new Date(new Date(aRecord.v))
    },

})