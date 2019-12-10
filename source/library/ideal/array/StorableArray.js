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

    didMutate (slotName) {
        super.didMutate()

        if (this.shouldSyncToStore()) {
            this.scheduleSyncToStore(slotName)
        }
    }

}.initThisClass()

