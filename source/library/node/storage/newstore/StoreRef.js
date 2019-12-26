"use strict"

/*

    StoreRef

*/


window.StoreRef = class StoreRef {
    
    static clone() {
        const instance = new StoreRef()
        instance.init()
        return instance
    }

    init () {
        Object.defineSlot(this, "_store", null)
    }

    setPid (aPid) {
        this["*"] = aPid
        return this
    }

    pid () {
        return this.getOwnProperty("*")
    }

    setStore (aStore) {
        this._store = aStore
        return this
    }

    store () {
        return this._store
    }

    unref () {
        return this.store().objectForPid(this.pid())
    }

    ref () {
        return this.store().refForPid(this.pid())
    }
    
}

