"use strict"

/*

    StorableArray



*/


window.StorableArray = class StorableArray extends HookedArray {

    initPrototype () {
    }

    init () {
        super.init()
    }

    defaultStore () {
        return PersistentObjectPool.shared()
    }

}.initThisClass()

