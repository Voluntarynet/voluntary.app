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


window.ObjectPool = class ObjectPool extends ProtoClass {
    
    initPrototype () {
        this.newSlots({
            name: "defaultDataStore",
            rootObject: null, 
            recordsDict: null, // AtomicDictionary
            activeObjects: null, // dict
            dirtyObjects: null, // dict 
            lastSyncTime: null, // WARNING: vulnerable to system time changes
            //isReadOnly: true,
            markedSet: null, // Set of puuids
            nodeStoreDidOpenNote: null, // TODO: change name?
        })
    }

    init () {
        super.init()
        this.setRecordsDict(ideal.AtomicDictionary.clone())
        this.setActiveObjects({})
        this.setDirtyObjects({})
        this.setLastSyncTime(null)
        this.setMarkedSet(null)
        this.setNodeStoreDidOpenNote(window.NotificationCenter.shared().newNote().setSender(this).setName("nodeStoreDidOpen"))
        this.setIsDebugging(true)
        return this
    }

    clearCache () {
        this.setActiveObjects({})
        this.setDirtyObjects({})
        this.readRoot()
        //this.setRootObject(this.objectForPid(this.rootObject().puuid()))
        return this
    }

    // --- open ---

    open () {
        this.recordsDict().setName(this.name())
        this.recordsDict().open()
        this.onRecordsDictOpen()
        return this
    }

    asyncOpen (callback) {
        this.recordsDict().setName(this.name())
        this.recordsDict().asyncOpen(() => {
            this.onRecordsDictOpen()
            if (callback) {
                callback()
            }
            //this.scheduleStore()
        })
        return this
    }

    onRecordsDictOpen () {
        this.readRoot()
        this.nodeStoreDidOpenNote().post()
        return this
    }

    isOpen () {
        return this.recordsDict().isOpen()
    }

    // --- root ---

    rootKey () {
        return "root"
    }

    hasStoredRoot () {
        return this.recordsDict().hasKey(this.rootKey())
    }

    rootOrIfAbsentFromClosure (aClosure) {
        if (!this.hasStoredRoot()) {
            const newRoot = aClosure()
            assert(newRoot)
            this.setRootObject(newRoot)
        }
        return this.rootObject()
    }

    readRoot () {
        //console.log(" this.hasStoredRoot() = " + this.hasStoredRoot())
        if (this.hasStoredRoot()) {
            const root = this.objectForPid(this.rootKey())
            this._rootObject = root
            //this.setRootObject()
        }
        return this.rootObject()
    }

    knowsObject (obj) { // private
        const puuid = obj.puuid()
        const foundIt = this.recordsDict().hasKey(puuid) ||
            this.activeObjects().hasOwnProperty(puuid) ||
            this.dirtyObjects().hasOwnProperty(puuid)
        return foundIt
    }

    assertOpen () {
        assert(this.isOpen())
    }

    changeOldPidToNewPid (oldPid, newPid) {
        // flush and change pids on all activeObjects 
        // and pids and pidRefs in recordsDict 
        throw new Error("unimplemented")
        return this
    }
    
    setRootObject (obj) {
        this.assertOpen()
        if (this._rootObject) {
            // can support this if we change all stored and
            //this.changeOldPidToNewPid("root", Object.newUuid())
            throw new Error("can't change root object yet, unimplemented")
        }

        assert(!this.knowsObject(obj))

        obj.setPuuid(this.rootKey())
        this._rootObject = obj
        this.addActiveObject(obj)
        this.addDirtyObject(obj)
        
        return this
    }

    // ---  ---

    asJson () {
        return this.recordsDict().asJson()
    }

    updateLastSyncTime () {
        this.setLastSyncTime(Date.now())
        return this
    }

    // --- active and dirty objects ---

    hasActiveObject (anObject) {
        const puuid = anObject.puuid()
        return this.activeObjects().hasOwnProperty(puuid)
    }
    
    addActiveObject (anObject) {
        if (!this.hasActiveObject(anObject)) {
            this.addDirtyObject(anObject) // only do this during ref creation?
        }
        this.activeObjects()[anObject.puuid()] = anObject
    }

    hasDirtyObjects () {
        return Object.keys(this.dirtyObjects()).length !== 0
    }

    addDirtyObject (anObject) {
        const puuid = anObject.puuid()
        if (!this.dirtyObjects()[puuid]) {
            this.debugLog("addDirtyObject(" + anObject.typeId() + ")")
            this.dirtyObjects()[puuid] = anObject
            this.addActiveObject(anObject)
            this.scheduleStore()
        }
        return this
    }

    scheduleStore () {
        const scheduler = SyncScheduler.shared()
        const methodName = "commitStoreDirtyObjects"
        if (!scheduler.isSyncingTargetAndMethod(this, methodName)) {
            if (!scheduler.hasScheduledTargetAndMethod(this, methodName)) {
                //console.warn("scheduleStore currentAction = ", SyncScheduler.currentAction() ? SyncScheduler.currentAction().description() : null)
                scheduler.scheduleTargetAndMethod(this, methodName, 1000)
            }
        }
        return this
    }

    // --- storing ---

    commitStoreDirtyObjects () {
        if (this.hasDirtyObjects()) {
            this.debugLog("--- commitStoreDirtyObjects begin ---")
            this.recordsDict().begin()
            const storeCount = this.storeDirtyObjects()
            this.recordsDict().commit()
            this.debugLog("--- commitStoreDirtyObjects end --- stored " + storeCount + " objects")
        }
    }

    storeDirtyObjects () { // PRIVATE
        let totalStoreCount = 0
        const justStored = {} // use a dict instead of set so we can inspect it for debugging

        while (true) {
            let thisLoopStoreCount = 0
            const dirtyBucket = this.dirtyObjects()
            this.setDirtyObjects({})

            Object.keys(dirtyBucket).forEach((puuid) => {
                const obj = dirtyBucket[puuid]

                //onsole.log("  storing pid " + puuid)
                if (justStored[puuid]) {
                    throw new Error("attempt to double store " + puuid)
                }

                this.storeObject(obj)
                justStored[puuid] = obj

                thisLoopStoreCount ++
            })

            totalStoreCount += thisLoopStoreCount
            //this.debugLog(() => "totalStoreCount: " + totalStoreCount)
            if (thisLoopStoreCount === 0) {
                break
            }
        }

        return totalStoreCount
    }

    // --- reading ---

    objectForRecord (aRecord) { // private
        const className = aRecord.type
        const aClass = window[className]
        if (!aClass) {
            throw new Error("missing class '" + className + "'")
        }
        const obj = aClass.instanceFromRecordInStore(aRecord, this)
        obj.setPuuid(aRecord.id)

        if(obj.scheduleLoadFinalize) {
            obj.scheduleLoadFinalize()
        }

        return obj
    }

    objectForPid (puuid) {
        const obj = this.activeObjects()[puuid]
        if (obj) {
            return obj
        }
        return this.objectForRecord(this.recordForPid(puuid))
    }

    //

    activeLazyPids () { // returns a set of pids
        const pids = new Set()
        this.activeObjects().ownForEachKV((pid, obj) => {
            if (obj.lazyPids) {
                obj.lazyPids(pids)
            }
        })
        return pids
    }

    // --- references ---

    refForPid (aPid) {
        return { "*": this.pid() }
    }

    pidForRef (aRef) {
        return aRef["*"]
    }

    unrefValueIfNeeded (v) {
        return this.unrefValue(v)
    }

    unrefValue (v) {
        if (Type.isLiteral(v)) {
            return v
        }
        const puuid = v["*"]
        assert(puuid)
        return this.objectForPid(puuid)
    }

    willRefObject (obj) { // TODO: remove this - it's transitional from NodeStore
        return this.refValue(obj)
    }

    refValue (v) {
        if (Type.isLiteral(v)) {
            return v
        }

        if (v.shouldStore && v.shouldStore() && !this.hasActiveObject(v)) {
            this.addDirtyObject(v)
        }

        this.addActiveObject(v)
        const ref = { "*": v.puuid() }
        return ref
    }

    // read a record

    recordForPid (puuid) { // private
        const jsonString = this.recordsDict().at(puuid)
        const aRecord = JSON.parse(jsonString)
        aRecord.id = puuid
        return aRecord
    }

    // write an object

    storeObject (obj) {
        const puuid = obj.puuid()
        if (Type.isUndefined(puuid)) {
            obj.puuid()
        }
        assert(puuid)
        let v = JSON.stringify(obj.recordForStore(this))
        console.log("storeObject(" + obj.typeId() + ")")
        //console.log(puuid + " <- " + v)
        this.recordsDict().atPut(puuid, v)
        return this
    }

    // -------------------------------------

    flushIfNeeded () {
        if (this.hasDirtyObjects()) {
            this.storeDirtyObjects()
            assert(!this.hasDirtyObjects())
        }
        return this
    }

    collect () {
        // this is an on-disk collection
        // in-memory objects aren't considered
        // so we make sure they're flushed to the db first 
        this.recordsDict().begin()
        this.flushIfNeeded() // store any dirty objects

        this.debugLog("--- begin collect ---")
        this.setMarkedSet(new Set())
        this.activeObjects().ownForEachKV((pid, obj) => this.markPid(pid))
        this.activeLazyPids().forEach(pid => this.markPid(pid))
        this.markPid(this.rootObject().puuid()) // this is recursive, but skips marked records
        const deleteCount = this.sweep()
        this.setMarkedSet(null)
        this.debugLog(() => "--- end collect - collected " + deleteCount + " pids ---")

        this.recordsDict().commit()
        return deleteCount
    }

    markPid (pid) { // private
        //this.debugLog(() => "markPid(" + pid + ")")
        if (!this.markedSet().has(pid)) {
            this.markedSet().add(pid)
            const refPids = this.refSetForPuuid(pid)
            //this.debugLog(() => "markPid " + pid + " w refs " + JSON.stringify(refPids))
            refPids.forEach(refPid => this.markPid(refPid))
            return true
        }
        return false
    }

    refSetForPuuid (puuid) {
        const record = this.recordForPid(puuid)
        const puuids = new Set()

        if (record) {
            Object.keys(record).forEach(k => this.puuidsSetFromJson(record[k], puuids))
        }

        return puuids
    }

    puuidsSetFromJson (json, puuids = new Set()) {
        // json can only contain array's, dictionaries, and literals.
        // We store dictionaries as an array of entries, 
        // and reserve dicts in the json for pointers with the format { "*": "<puuid>" }

        //console.log(" json: ", JSON.stringify(json, null, 2))

        if (Type.isLiteral(json)) {
            // we could call refsPidsForJsonStore but, none will add any pids 
            // and null raises exception, so just skip it
        } else if (Type.isObject(json) && json.refsPidsForJsonStore) {
            json.refsPidsForJsonStore(puuids)
        } else {
            throw new Error("unable to handle json type: " + typeof(json) + " missing refsPidsForJsonStore() method?")
        }
        
        return puuids
    }

    // ------------------------

    sweep () {
        // delete all unmarked records
        let deleteCount = 0
        const recordsDict = this.recordsDict()
        this.recordsDict().keys().forEach((pid) => {
            if (!this.markedSet().has(pid)) {
                //this.debugLog("deletePid(" + pid + ")")
                recordsDict.removeAt(pid)
                deleteCount ++
            }
        })

        return deleteCount
    }

    // ---------------------------

    /*
    selfTestRoot () {
        const aTypedArray = Float64Array.from([1.2, 3.4, 4.5])
        const aSet = new Set("sv1", "sv2")
        const aMap = new Map([ ["mk1", "mv1"], ["mk2", "mv2"] ])
        const aNode = BMStorableNode.clone()
        const a = [1, 2, [3, null], { foo: "bar", b: true }, aSet, aMap, new Date(), aTypedArray, aNode]
        return a
    }

    selfTest () {
        console.log(this.type() + " --- self test start --- ")
        const store = ObjectPool.clone()
        store.open()

        store.rootOrIfAbsentFromClosure(() => BMStorableNode.clone())
        store.flushIfNeeded()
        console.log("store:", store.asJson())
        console.log(" --- ")
        store.collect()
        store.clearCache()
        const loadedNode = store.rootObject()
        console.log("loadedNode = ", loadedNode)
        console.log(this.type() + " --- self test end --- ")

    }
    */

    rootInstanceWithPidForProto (aTitle, aProto) {
        return this.rootObject().subnodeWithTitleIfAbsentInsertClosure(aTitle, () => aProto.clone())
    }

    totalBytes () {
        return this.recordsDict().totalBytes()
    }

}.initThisClass()


// -------------------

/*
setTimeout(() => {
    ObjectPool.selfTest()
}, 1000)
*/


