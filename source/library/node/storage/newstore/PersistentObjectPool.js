"use strict"

/*

    PersistentObjectPool

        An ObjectPool that uses a PersistentAtomicDictionary
        to store it's records.

*/

window.PersistentObjectPool = class PersistentObjectPool extends ObjectPool {
    
    initPrototype () {

    }

    init () {
        super.init()
        this.setName("defaultDataStore")
        this.setRecordsDict(AtomicPersistentDictionary.clone())
        return this
    }

    open () {
        throw new Error(this.type() + " synchronous open not available - use asyncOpen()")
    }

    selfTest () {
        console.log(this.type() + " --- self test start --- ")
        const store = this.thisClass().clone()
        store.asyncOpen(() => this.selfTestOnStore(store))
    }

    selfTestOnStore (store) {
        store.rootOrIfAbsentFromClosure(() => BMStorableNode.clone())
        //store.flushIfNeeded()
        console.log("store:", store.asJson())
        console.log(" --- ")
        store.collect()
        store.clearCache()
        const loadedNode = store.rootObject()
        console.log("loadedNode = ", loadedNode)
        console.log(this.type() + " --- self test end --- ")
    }
    
}.initThisClass()


//setTimeout(() => {
//PersistentObjectPool.selfTest()
//}, 1000)


