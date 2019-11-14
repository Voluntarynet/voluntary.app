"use strict"

/*
Object.defineSlots(BMStorableNode, {

    recordForStore: function(aStore) { // should only be called by Store
        
        const dict = {}

        Object.keys(this.storedSlots()).forEach((k) => {
            const v = this.getStoreSlotValue(k)
            dict[k] = aStore.refValue(v)
        })

        return {
            type: this.type(), 
            dict: dict, 
        }
    },

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store    
        const proto = window[aRecord.type]
        const obj = proto.clone()
        const dict = aRecord.dict

        Object.keys(aDict).forEach((k) => {
            if(!this.setStoreSlotValue(k, aDict[k], aStore)) {
                // slot was missing, so store it again without it
                if (!aStore.isReadyOnly()) {
                    this.scheduleSyncToStore()
                }
            }
        })

        return obj
    },
})
*/