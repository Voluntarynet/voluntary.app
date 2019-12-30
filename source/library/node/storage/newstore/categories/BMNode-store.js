"use strict"


Object.defineSlots(BMNode, {

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store    
        //const proto = window[aRecord.type]
        const obj = this.clone()
        //obj.loadFromRecord(aRecord, aStore)
        return obj
    },

})


Object.defineSlots(BMNode.prototype, {
    
    recordForStore: function(aStore) { // should only be called by Store
        const aRecord = {
            type: this.type(), 
            entries: [], 
        }

        this.allSlots().ownForEachKV((slotName, slot) => {
            //if (slot.shouldStoreSlot()) {
            if (slot.shouldStoreSlotOnInstance(this)) {
                const v = slot.onInstanceGetValue(this)
                assert(!Type.isUndefined(v))
                // aStore.refValue(v) is not enough to ensure that if 
                // v is a non-node object, that it's changes will be stored
                // as those types have no setter hooks

                aRecord.entries.push([slotName, aStore.refValue(v)])
            }
        })

        return aRecord
    },

    lazyPids: function(puuids = new Set()) {
        // when doing Store.collect() will need to check for lazy slot pids on active objects
        this.allSlots().ownForEachKV((slotName, slot) => {
            // only need to do this on unloaded store refs in instances
            const storeRef = slot.onInstanceGetValueRef(this)
            if (storeRef) {
                puuids.add(storeRef.pid())
            }
        })
        return puuids
    },


    loadFromRecord: function(aRecord, aStore) {

        aRecord.entries.forEach((entry) => {
            const k = entry[0]
            const v = entry[1]

            const slot = this.instanceSlotNamed(k)

            if (slot) {
                if (!slot.hasSetterOnInstance(this)) {
                    // schema must have changed 
                    // so schedule to store again, which will remove missing slot in record
                    this.scheduleSyncToStore()
                } else {
                    if (slot.isLazy()) {
                        const pid = v["*"]
                        assert(pid)
                        const storeRef = StoreRef.clone().setPid(pid).setStore(aStore)
                        //console.log(this.typeId() + "." + slot.name() + " [" + this.title() + "] - setting up storeRef ")
                        slot.onInstanceSetValueRef(this, storeRef)
                    } else {
                        const unrefValue = aStore.unrefValue(v)
                        slot.onInstanceSetValue(this, unrefValue)
                    }
                }
            }
        })

        //this.didLoadFromStore()
        return this
    },

    scheduleFinalize: function () {
        // Object scheduleFinalize just calls this.finalize()
        assert(!this.isFinalized())
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "finalize")
    },

    scheduleLoadFinalize: function() {
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "loadFinalize")
    },

    /*
    loadFinalize: function() {
        // Object.loadFinalize handles this
    },
    */

})
