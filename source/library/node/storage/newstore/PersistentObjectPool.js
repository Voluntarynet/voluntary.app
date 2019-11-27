"use strict"

/*

    PersistentObjectPool

        An ObjectPool that uses a PersistentAtomicDictionary
        to store it's records.


*/


// need a pidRefsFromPid

window.PersistentObjectPool = class PersistentObjectPool extends ProtoClass {
    
    initPrototype () {
        this.newSlots({
            name: "defaultDataStore",
        })
    }

    init () {
        super.init()
        this.setRecordsDict(AtomicPersistentDictionary.clone())
        return this
    }

    shared () {
        return this.sharedInstanceForClass(PersistentObjectPool)
    }

    selfTest  () {
        console.log(this.type() + " --- self test start --- ")
        const store = this.typeClass().clone()
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

    rootInstanceWithPidForProto (aTitle, aProto) {
        return this.rootObject().subnodeWithTitleIfAbsentInsertClosure(aTitle, () => aProto.clone())
    }
    
}.initThisClass()


//setTimeout(() => {
//PersistentObjectPool.selfTest()
//}, 1000)


