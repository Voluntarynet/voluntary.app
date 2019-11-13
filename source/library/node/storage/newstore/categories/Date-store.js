"use strict"

Object.defineSlots(Date.prototype, {
    recordForStore: function(aStore) { // should only be called by Store
        return {
            type: "Date", 
            v: this.toJSON()
        }
    },
})

Object.defineSlots(Date, {
    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
        assert(aRecord.type === "Date")
        return new Date(new Date(aRecord.v))
    },

})