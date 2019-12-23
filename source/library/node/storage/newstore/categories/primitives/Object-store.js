"use strict"


Object.defineSlots(Object, {

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store
        assert(aRecord.type === "Object")
        const obj = {}
        obj.loadFromRecord(aRecord, aStore)
        return obj
    }

})


Object.defineSlots(Object.prototype, {

    loadFromRecord: function(aRecord, aStore) {
        assert(aRecord.type === "Object")
        aRecord.entries.forEach((entry) => {
            const k = entry[0]
            const v = entry[1]
            this[k] = aStore.unrefValue(v)
        })
        return this
    },

    recordForStore: function(aStore) { // should only be called by Store
        const entries = []

        Object.keys(this).forEach((k) => {
            const v = this[k]
            entries.push([k, aStore.refValue(v)])
        })

        return {
            type: this.type(), 
            entries: entries, 
        }
    },

    shouldStore: function() {
        return this._shouldStore
    },

    refsPidsForJsonStore: function(puuids = new Set()) {
        if (this.hasOwnProperty("*")) {
            puuids.add(this["*"])
        } else {
            throw new Error("dictionaries are reserved for pointers, but we found a non-pointer")
        }
        return puuids
    },
    
    defaultStore: function() {
        return PersistentObjectPool.shared()
    },

    scheduleSyncToStore: function(slotName) {
        this.didMutate()
    },

    loadFinalize: function()   {
        if (this.didLoadFromStore) {
            this.didLoadFromStore()
        }
    },

})
