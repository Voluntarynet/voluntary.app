"use strict"

Object.defineSlots(Object.prototype, {

    recordForStore: function(aStore) { // should only be called by Store
        const entries = []

        Object.getOwnPropertyNames(this).forEach((k) => {
            const v = this[k]
            entries.push([k, aStore.refValue(v)])
        })

        return {
            type: "Object", 
            entries: entries, 
        }
    },

    shouldStore: function() {
        return true
    },

    storeJsonRefs: function(puuids = new Set()) {
        if (this.hasOwnProperty("*")) {
            puuids.add(this["*"])
        } else {
            throw new Error("dictionaries are reserved for pointers, but we found a non-pointer")
        }
        return puuids
    },
})

Object.defineSlots(Object, {

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
        assert(aRecord.type === "Object")
        const obj = {}
        aRecord.entries.forEach((entry) => {
            const k = entry[0]
            const v = entry[1]
            obj[k] = aStore.unrefValue(v)
        })
        return obj
    }

})