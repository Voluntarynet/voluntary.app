"use strict"

/*

    PersistentObjectPool

        An ObjectPool that uses a PersistentAtomicDictionary
        to store it's records.


*/


// need a pidRefsFromPid

window.ObjectPool.newSubclassNamed("PersistentObjectPool").newSlots({
    name: "defaultDataStore",
}).setSlots({
    init: function() {
        ObjectPool.init.apply(this)
        this.setRecordsDict(AtomicPersistentDictionary.clone())
        return this
    },

    shared: function() {
        return this.sharedInstanceForClass(PersistentObjectPool)
    },

    selfTest: function () {
        console.log(this.type() + " --- self test start --- ")
        const store = this.typeClass().clone()
        store.asyncOpen(() => this.selfTestOnStore(store))
    },

    selfTestOnStore: function(store) {
        store.rootOrIfAbsentFromClosure(() => BMStorableNode.clone())
        //store.flushIfNeeded()
        console.log("store:", store.asJson())
        console.log(" --- ")
        store.collect()
        store.clearCache()
        const loadedNode = store.rootObject()
        console.log("loadedNode = ", loadedNode)
        console.log(this.type() + " --- self test end --- ")
    },

    rootInstanceWithPidForProto: function(aTitle, aProto) {
        return this.rootObject().subnodeWithTitleIfAbsentInsertClosure(aTitle, () => aProto.clone())
    },
})


//setTimeout(() => {
//PersistentObjectPool.selfTest()
//}, 1000)


