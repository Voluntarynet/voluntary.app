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
    rootObject: null, 
    recordsDict: null, // AtomicDictionary
    activeObjects: null, // dict
    dirtyObjects: null, // dict 
    lastSyncTime: null, // WARNING: vulnerable to system time changes
    //isReadOnly: true,
}).setSlots({
    init: function() {
        ideal.Proto.init.apply(this)
        this.setRootObject(null)
        this.setRecordsDict(ideal.AtomicDictionary.clone())
        this.setActiveObjects({})
        this.setDirtyObjects({})
        this.setLastSyncTime(null)
        return this
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

    recordForPid: function(puuid) {
        return this.recordsDict().at(puuid)
    },

    objectForRecord: function(aRecord) {
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

    storeObject: function(obj) {
        const puuid = obj.puuid()
        assert(puuid)
        this.recordsDict().atPut(puuid, obj.recordForStore(this))
        return this
    },

    publicStoreObject: function(obj) {
        this.addActiveObject(obj)
        this.addDirtyObject(obj)
        this.atomicallyStoreDirtyObjects()
        return this
    },

})

// -------------------

const test = function () {
    const simpleStore = SimpleStore.clone()

    const fa = new Float64Array(3)
    fa[0] = 1.2
    fa[1] = 3.4
    fa[1] = 5.6

    const node = BMNode.clone()
    const a = [1, 2, [3, null], { foo: "bar", b: true }, new Date(), fa, node]

    simpleStore.publicStoreObject(a)
    console.log(simpleStore.asJson())
    console.log("---")

    /*
    const aSerialized = JSON.stringify(a, null, 2)
    console.log("aSerialized: " + aSerialized + "\n")
    simpleStore.storeObject(a)

    console.log(simpleStore.asJson())
    console.log("-----------------")

    const b = simpleStore.objectForPid(a.puuid())
    const bSerialized = JSON.stringify(b, null, 2)
    console.log("bSerialized: " + bSerialized + "\n")
    assert(aSerialized === bSerialized)
    console.log("test passed")
    */
}

test()


