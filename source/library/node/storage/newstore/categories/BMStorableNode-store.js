"use strict"

Object.defineSlots(BMStorableNode, {

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store    
        const proto = window[aRecord.type]
        const obj = proto.clone()
        obj.loadFromRecord(aRecord, aStore)
        return obj
    },

})

Object.defineSlots(BMStorableNode.prototype, {

    recordForStore: function(aStore) { // should only be called by Store
        const aRecord = {
            type: this.type(), 
            slots: [], 
        }
        
        Object.keys(this.storedSlotNames()).forEach((k) => {
            const v = this.getStoreSlotValue(k)
            aRecord.slots.push([k, aStore.refValue(v)])
        })

        //aRecord.subnodesRecord = this.subnodes().recordForStore(aStore)

        return aRecord
    },
    
    loadFromRecord: function(aRecord, aStore) {
        this.setIsUnserializing(true)
        const slots = aRecord.slots

        slots.forEach((entry) => {
            const k = entry[0]
            const v = entry[1]
            if(!this.setStoreSlotValue(k, v, aStore)) {
                // slot was missing, so store it again without it
                if (!aStore.isReadyOnly()) {
                    this.scheduleSyncToStore()
                }
            }
        })

        //this.setSubnodesRecord(aRecord.subnodesRecord) 

        //const subnodes = Array.instanceFromRecordInStore(this.subnodesRecord(), aStore)
        //this.setSubnodePids(aRecord.children, aStore) // only calls aStore.objectForPid

        this.didLoadFromStore()
        this.scheduleLoadFinalize()

        this.setIsUnserializing(false) 
        return this
    },
})
