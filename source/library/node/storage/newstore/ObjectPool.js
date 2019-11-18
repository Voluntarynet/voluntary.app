"use strict"

/*

    ObjectPool

        For persisting a node tree to JSON and back.
        Usefull for exporting nodes out the the app/browser
        and into others.

        JSON format:

            {
                rootPid: "rootPid",
                puuidToDict: {
                    "objPid" : <nodeDict>
                }

            }

        Example use:
    
            // converting a node to json
            const poolJson = ObjectPool.clone().setRoot(rootNode).asJson()
            
            // converting json to a node
            const rootNode = ObjectPool.clone().fromJson(poolJson).root()


    Literal values can be directly stored in JSON such as:

            String
            Number
            Boolean
            null

    Others need to be encoded, such as:

            Array // need to check for references
            a dictionary
            Date

            { __type__: "Array", v: [] }

    And nodes need to be encoded references: 

            BMNode

    BMNode needs to be referenced by a puuid and the Store needs to know it needs to be written if not already present.



*/


// need a pidRefsFromPid

ideal.Proto.newSubclassNamed("SimpleStore").newSlots({
    name: "defaultDataStore",
    rootObject: null, 
    recordsDict: null, // AtomicDictionary
    activeObjects: null, // dict
    dirtyObjects: null, // dict 
    lastSyncTime: null, // WARNING: vulnerable to system time changes
    //isReadOnly: true,
    marked: null, // Set of puuids
}).setSlots({
    init: function() {
        ideal.Proto.init.apply(this)
        this.setRootObject(null)
        this.setRecordsDict(ideal.AtomicDictionary.clone())
        this.setActiveObjects({})
        this.setDirtyObjects({})
        this.setLastSyncTime(null)
        this.setMarked(null)
        return this
    },

    setRootObject: function(obj) {
        if (this._rootObject !== obj) {
            this._rootObject = obj
            this.addActiveObject(obj)
            this.addDirtyObject(obj) // skip when reading it from records?
        }
        return this
    },

    readRoot: function() {
        const recordsDict = this.recordsDict()
        const rootKey = "root"
        // do we want this? What if object store is for copy?
        if (!recordsDict.has(rootKey)) {  
            const rootObj = {}
            rootObj.setPuuid(rootKey)
            recordsDict.begin()
            recordsDict.atPut(rootKey, rootObj)
            recordsDict.commit()
        }
        return recordsDict.at(rootKey)
    },

    asJson: function() {
        return this.recordsDict().asJson()
    },

    updateLastSyncTime: function() {
        this.setLastSyncTime(Date.now())
        return this
    },

    hasActiveObject: function(anObject) {
        const puuid = anObject.puuid()
        return this.activeObjects().hasOwnProperty(puuid)
    },

    addDirtyObject: function(anObject) {
        const puuid = anObject.puuid()
        this.dirtyObjects()[puuid] = anObject
        return this
    },

    addActiveObject: function(anObject) {
        if (!this.hasActiveObject(anObject)) {
            this.addDirtyObject(anObject) // only do this during ref creation?
        }
        this.activeObjects()[anObject.puuid()] = anObject
    },

    atomicallyStoreDirtyObjects: function() {
        this.recordsDict().begin()
        this.justStoreDirtyObjects()
        this.recordsDict().commit() // flushes write cache
        this.updateLastSyncTime()
        return this
    },

    justStoreDirtyObjects: function() { // PRIVATE
        let totalStoreCount = 0
        const justStored = {} // use a dict instead of set so we can inspect it for debugging

        while (true) {
            let thisLoopStoreCount = 0
            const dirtyBucket = this.dirtyObjects()
            this.setDirtyObjects({})

            Object.keys(dirtyBucket).forEach((puuid) => {
                const obj = dirtyBucket[puuid]

                if (justStored[puuid]) {
                    throw new Error("attempt to double store " + puuid)
                }

                this.storeObject(obj)
                justStored[puuid] = obj

                thisLoopStoreCount ++
            })

            totalStoreCount += thisLoopStoreCount
            //console.log("totalStoreCount: ", totalStoreCount)
            if (thisLoopStoreCount === 0) {
                break
            }
        }

        return totalStoreCount
    },

    objectForRecord: function(aRecord) { // private
        const aClass = window[aRecord.type]
        const obj = aClass.instanceFromRecordInStore(aRecord, this)
        obj.setPuuid(aRecord.id)
        return obj
    },

    objectForPid: function(puuid) {
        const obj = this.activeObjects()[puuid]
        if (obj) {
            return obj
        }
        return this.objectForRecord(this.recordForPid(puuid))
    },

    unrefValue: function(v) {
        if (Type.isLiteral(v)) {
            return v
        }
        const puuid = v["*"]
        assert(puuid)
        return this.objectForPid(puuid)
    },

    refValue: function(v) {
        if (Type.isLiteral(v)) {
            return v
        }

        if (v.shouldStore && v.shouldStore() && !this.hasActiveObject(v)) {
            this.addDirtyObject(v)
        }

        this.addActiveObject(v)
        const ref = { "*": v.puuid() }
        return ref
    },

    // read a record

    recordForPid: function(puuid) { // private
        const jsonString = this.recordsDict().at(puuid)
        const aRecord = JSON.parse(jsonString)
        return aRecord
    },

    // write a record

    storeObject: function(obj) {
        const puuid = obj.puuid()
        assert(puuid)
        this.recordsDict().atPut(puuid, JSON.stringify(obj.recordForStore(this)))
        return this
    },

    // --- test ----------------------------

    publicStoreObject: function(obj) {
        this.addActiveObject(obj)
        this.addDirtyObject(obj)
        this.atomicallyStoreDirtyObjects()
        return this
    },

    // -------------------------------------

    hasDirtyObjects: function() {
        return Object.keys(this.dirtyObjects()).length !== 0
    },

    flushIfNeeded: function () {
        if (this.hasDirtyObjects()) {
            this.atomicallyStoreDirtyObjects()
            assert(!this.hasDirtyObjects())
        }
        return this
    },

    collect: function () {
        // this is an on-disk collection
        // in-memory objects aren't considered
        // so we make sure they're flushed to the db first 
        this.flushIfNeeded()

        this.debugLog("--- begin collect ---")
        this.setMarked(new Set())
        this.markPid(this.rootObject().puuid()) // this is recursive, but skips marked records
        const deleteCount = this.atomicallySweep()
        this.setMarked(null)
        this.debugLog("--- end collect - collected " + deleteCount + " pids ---")
        return deleteCount
    },

    markPid: function (pid) {
        //this.debugLog("markPid(" + pid + ")")
        if (!this.marked().has(pid)) {
            this.marked().add(pid)
            const refPids = this.refSetForPuuid(pid)
            //this.debugLog("markPid " + pid + " w refs " + JSON.stringify(refPids))
            refPids.forEach(refPid => this.markPid(refPid))
            return true
        }
        return false
    },

    refSetForPuuid: function (puuid) {
        const record = this.recordForPid(puuid)
        const puuids = new Set()

        if (record) {
            Object.keys(record).forEach(k => this.puuidsSetFromJson(record[k], puuids))
        }

        return puuids
    },

    puuidsSetFromJson: function(json, puuids = new Set()) {
        // json can only contain array's, dictionaries, and literals.
        // We store dictionaries as an array of entries, 
        // so dicts in the json are reserved for pointers

        //console.log(" json: ", JSON.stringify(json, null, 2))

        if (Type.isLiteral(json)) {
            // we could call storeJsonRefs but, none will add any pids 
            // and null raises exception, so just skip it
        } else if (Type.isObject(json) && json.storeJsonRefs) {
            json.storeJsonRefs(puuids)
        } else {
            throw new Error("unable to handle json type: " + typeof(json))
        }
        
        return puuids
    },

    // ------------------------

    atomicallySweep: function () {
        this.debugLog(" --- sweep --- ")
        this.recordsDict().begin()
        const deleteCount = this.justSweep()
        this.recordsDict().commit()
        return this
    },

    justSweep: function () {
        // delete all unmarked records
        let deleteCount = 0
        this.recordsDict().keys().forEach((pid) => {
            if (!this.marked().has(pid)) {
                //this.debugLog("deletePid(" + pid + ")")
                this.recordsDict().removeAt(pid)
                deleteCount ++
            }
        })

        return deleteCount
    },
})

// -------------------

const test = function () {
    const store = SimpleStore.clone()

    const aTypedArray = Float64Array.from([1.2, 3.4, 4.5])
    const aSet = new Set("sv1", "sv2")
    const aMap = new Map([ ["mk1", "mv1"], ["mk2", "mv2"] ])
    const aNode = BMNode.clone()
    const a = [1, 2, [3, null], { foo: "bar", b: true }, aSet, aMap, new Date(), aTypedArray, aNode]

    store.setRootObject(a)
    store.publicStoreObject(a)
    //console.log(store.asJson())
    console.log("---")
    store.collect()

    /*
    const aSerialized = JSON.stringify(a, null, 2)
    console.log("aSerialized: " + aSerialized + "\n")
    store.storeObject(a)

    console.log(store.asJson())
    console.log("-----------------")

    const b = store.objectForPid(a.puuid())
    const bSerialized = JSON.stringify(b, null, 2)
    console.log("bSerialized: " + bSerialized + "\n")
    assert(aSerialized === bSerialized)
    console.log("test passed")
    */
}

test()


