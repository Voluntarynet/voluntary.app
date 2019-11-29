"use strict"

Object.defineSlots(BMNode, {

    recordForStore: function(aStore) { // should only be called by Store
        
        const entries = []

        /*
        Object.getOwnPropertyNames(this).forEach((k) => {
            const v = this[k]
            dict[k] = aStore.refValue(v)
        })
        */

        return {
            type: this.type(), 
            entries: entries, 
        }
    },

    lazyPids: function(puuids = new Set()) {
        // pids from lazy slots
        // when doing Store.collect() will need to check these on active objects
        this.allSlots().forEach((slot) => {
            const storeRef = onInstanceGetValueRef(this)
            if (storeRef) {
                puuids.add(storeRef.pid())
            }
        })
        return puuids
    },

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store    
        const proto = window[aRecord.type]
        const obj = proto.clone()
        const entries = aRecord.entries

        entries.forEach((entry) => {
            const k = entry[0]
            const v = entry[1]

            const slot = this.slotNamed(k)

            if (slot.isLazy()) {
                const pid = aStore.pidFromRef(v)
                const storeRef = StoreRef.clone().setPid(pid).setStore(aStore)
                slot.onInstanceSetValueRef(obj, storeRef)
            } else {
                const unrefValue = aStore.unrefValue(v)
                slot.onInstanceSetValue(obj, unrefValue)
            }
        })
        
        return obj
    },
})