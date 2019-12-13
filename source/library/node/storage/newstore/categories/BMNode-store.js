"use strict"


Object.defineSlots(BMNode, {

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store    
        const proto = window[aRecord.type]
        const obj = proto.clone()
        obj.loadFromRecord(aRecord, aStore)
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
            if (slot.shouldStore()) {
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
        //this.setIsUnserializing(true)

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
                    if (false && slot.isLazy()) {
                        const pid = v["*"]
                        assert(pid)
                        const storeRef = StoreRef.clone().setPid(pid).setStore(aStore)
                        console.log(this.typeId() + "." + slot.name() + " - setting up storeRef ")
                        slot.onInstanceSetValueRef(this, storeRef)
                    } else {
                        const unrefValue = aStore.unrefValue(v)
                        slot.onInstanceSetValue(this, unrefValue)
                    }
                }
            }
        })

        this.didLoadFromStore()
        this.scheduleLoadFinalize()
        //this.setIsUnserializing(false) 
        return this
    },

    willGetSlot: function(slotName) {
        ProtoClass.prototype.willGetSlot.apply(this, [slotName])
        let slot = this.instanceSlotNamed(slotName)
        console.log(this.typeId() + ".willGetSlot('" + slotName + "')")
        if (slot.isLazy()) {
            slot.onInstanceLoadRef(this)
        }
    },

    scheduleLoadFinalize: function() {
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "loadFinalize")
    },
    
    loadFinalize: function() {
        // called after all objects loaded within this event cycle
    },
	
    didLoadFromStore: function() {
        //this.debugLog(" didLoadFromStore in BMStorableNode")
        // chance to finish any unserializing this particular instance
        // also see: loadFinalize
		
        //this.checkForStoredSlotsWithoutPids()
    },

})
