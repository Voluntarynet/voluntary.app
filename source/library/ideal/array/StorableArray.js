"use strict"

/*

    StorableArray

    A subclass of HookedArray adds a shouldSyncToStore property, 
    and overrides didMutate() to tell the store about changes.

*/


window.StorableArray = class StorableArray extends HookedArray {

    initPrototype () {
    }

    init () {
        super.init()
        Object.defineSlot(this, "_shouldSyncToStore", true) 
    }

    setShouldSyncToStore (aBool) {
        this._shouldSyncToStore = aBool
        return this
    }

    shouldSyncToStore () {
        return this._shouldSyncToStore
    }

    scheduleSyncToStore (slotName) {
        //console.log(this.typeId() + " scheduleSyncToStore (via " + slotName + ")")
        this.defaultStore().addDirtyObject(this)
    }

    defaultStore () {
        return PersistentObjectPool.shared()
    }

    didMutate (slotName) {
        super.didMutate()

        if (this.shouldSyncToStore()) {
            this.scheduleSyncToStore(slotName)
        }
    }

}.initThisClass()

