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

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store    
        const proto = window[aRecord.type]
        const obj = proto.clone()
        const entries = aRecord.entries

        /*
        entries.forEach((entry) => {
            const k = entry[0]
            const v = entry[1]
            const unrefValue = aStore.unrefValue(v)
        })
        */
        return obj
    },
})