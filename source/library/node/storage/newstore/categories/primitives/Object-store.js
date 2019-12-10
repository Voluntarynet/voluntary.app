"use strict"


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

    refsPidsForJsonStore: function(puuids = new Set()) {
        if (this.hasOwnProperty("*")) {
            puuids.add(this["*"])
        } else {
            throw new Error("dictionaries are reserved for pointers, but we found a non-pointer")
        }
        return puuids
    },

    _shouldSyncToStore: false, // need to do this with defineSlot

    setShouldSyncToStore: function(aBool) {
        Object.defineSlotIfNeeded(this, "_shouldSyncToStore", aBool)
        return this
    },

    shouldSyncToStore: function() {
        return this._shouldSyncToStore
    },

    // mutation

    willMutate: function(slotName) {
        //console.log(slotName + " hooked!")
        // hook this on instances where we need to know about changes
        if (this._shouldSyncToStore) {
            this.scheduleSyncToStore()
        }
    },
    
    /*
    syncToStoreOnMutation: function() {
        this["willMutate"] = this.scheduleSyncToStore
    },
    */
    
    defaultStore: function() {
        return PersistentObjectPool.shared()
    },
    
    scheduleSyncToStore: function(slotName) {
        console.log("Array scheduleSyncToStore " + slotName + " hooked!")
        this.defaultStore().addDirtyObject(this)
    },
})
