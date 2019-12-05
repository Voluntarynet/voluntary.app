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
                aRecord.entries.push([slotName, aStore.refValue(v)])
            }
        })

        return aRecord
    },

    lazyPids: function(puuids = new Set()) {
        // when doing Store.collect() will need to check for lazy slot pids on active objects
        this.allSlots().forEach((slot) => {
            const storeRef = slot.onInstanceGetValueRef(this)
            if (storeRef) {
                puuids.add(storeRef.pid())
            }
        })
        return puuids
    },


    loadFromRecord: function(aRecord, aStore) {
        this.setIsUnserializing(true)

        aRecord.entries.forEach((entry) => {
            const k = entry[0]
            const v = entry[1]

            const slot = this.slotNamed(k)

            if (!slot.hasSetterOnInstance(this)) {
                this.scheduleSyncToStore()
            } else {

                if (slot.isLazy()) {
                    const pid = aStore.pidFromRef(v)
                    const storeRef = StoreRef.clone().setPid(pid).setStore(aStore)
                    slot.onInstanceSetValueRef(obj, storeRef)
                } else {
                    const unrefValue = aStore.unrefValue(v)
                    slot.onInstanceSetValue(obj, unrefValue)
                }
            }

        })

        this.didLoadFromStore()
        this.scheduleLoadFinalize()
        this.setIsUnserializing(false) 
        return this
    },

    willGetSlot: function(slotName) {
        ProtoClass.willGetSlot.apply(this, [slotName])
        let slot = this.slotNamed(slotName)
        let storeRef = slot.onInstanceGetValueRef(this)
        if (storeRef) {
            let obj = storeRef.unref()
            slot.onInstanceSetValue(this, obj)
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
