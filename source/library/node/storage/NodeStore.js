"use strict"

/*

    NodeStore

		An object store for BMStorableNode objects, that supports 
		- a read reference cache of "activeObjects" so re-loading an object will reference the same instance
		- a write reference cache of "dirtyObjects"
		- automatic tracking of dirty objects (objects whose state needs to be persisted)
		- group transactional writes of dirty objects ( nodeStore.storeDirtyObjects() )
		- on disk garbage collection of no longer referenced persisted objects ( nodeStore.collect() )	
		- supports circular references and collecting them when no longer referenced
        - multiple collection roots
    
    Garbage collection:
    
		The collector can have multiple roots. Any object stored with a pid (persistent Id) that begins
		with an underscore will be treated as a root object and always marked when collecting garbage.
		
        Example:
 
				const people = NodeStore.rootInstanceWithPidForProto("_people", PeopleNode) 
		
		This instantiates the object if it's not persisted, loads it if it is, and returns any already 
		unpersisted instance if there is one.

	Active objects:
    
        Whenever a BNStorableNode instance is created, it's init method tells the (shared) store of 
        it's existence ( addActiveObject(aNode) ) and marks itself as dirty if it's not being unserialized.
        
        All dirty objects are transactionally persisted on the next event loop 
        (or end of curent event if supported). 
		This avoids multiple writes for multiple changes within a given loop.
    
    Persistent ids:
    
        each object is assigned a _pid property when persisted 
        _pid is a unique persistent id (as a string the format typeName_uuid) for the object.
    
        If a serialized object record dictionary value points to a simple type 
        (such as a string or number), it's value is stored in json.
        Otherwise, it's value is stored as a pid reference in a dictionary 
        like { _pid: pidNum }. 
    
    Writing and reading objects:
    
        BMStorableNode defines nodeDict() and setNodeDict(aDict) methods
        a nodeDict is JSON dict and contains a type slot which contains the object type name
        such that:
    
            window[typeName].clone().setNodeDict(nodeDict).didLoadFromStore()
        
        can be used to unserialize the object. Object's are responsible for unserializing 
        the nodeDict. The NodeStore.refForObject(obj) and NodeStore.objectForRef(refDict) can be used
        to contruct refs and derefence them as needed.

        Example use:
    
            // storing

                const store = NodeStore.clone().setFolderName("store")
            
            // need to define a root
            
                const root = BMStorableNode.clone()
                store.setRootObject(root)
                store.load()
            
            // when you modify any BMStorableNode instance's subnodes or stored data slots, 
            // or call scheduleSyncToStore() on it, it will be marked as needing to be persisted in the
            // next event loop. Examples:
            
                const test = BMNode.clone()
                root.addSubnode(test) // this marks root as dirty
                test.addSubnode(foo) // this marks test as dirty
                // next event loop will commit changes for root and test
                        
            // for singleton objects, set their pid to a unique name, e.g.
            
                SomeProto.rootInstanceForPid("_servers")
            
            // to force an immediate store
            
                store.store()
            

            // loading

                const nodeStore = NodeStore.shared()
                nodeStore.asyncOpen(() => { 
                    // store is opened
                })
            
    
    Garbage collection
    
        Periodically (e.g. when opening/closing an app) you'll want to delete any unreferenced
        object records to make sure they don't use up too much space. To do this call:
    
            pdb.collect()

 
*/

ideal.Proto.newSubclassNamed("NodeStore").newSlots({
    name: "defaultStoreName",

    dirtyObjects: null, // objects that need to be persisted
    activeObjectsDict: null, // objects unpersisted - tracking to ensure all refs point to same instance

    sdb: null,
    isReadOnly: false,

    nodeStoreDidOpenNote: null,
    lastSyncTime: null,
    //changedObs: null,
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
        this.setDirtyObjects({})
        this.setActiveObjectsDict({})
        this.setSdb(window.SyncDB.clone())
        this.setNodeStoreDidOpenNote(window.NotificationCenter.shared().newNote().setSender(this).setName("nodeStoreDidOpen"))

        /*
        const obs = NotificationCenter.shared().newObservation().setName("changedStoredSlot").setObserver(this)
        this.setChangedObs(obs)
        */

        this.setIsDebugging(false)

        Broadcaster.shared().addListenerForName(this, "didChangeStoredSlot")
    },

    didChangeStoredSlot: function(aTarget) {
        this.addDirtyObject(aTarget)
    },
    
    startWatchingForDirtyObjects: function() {
        Broadcaster.shared().addListenerForName(this, "didChangeStoredSlot")
        //this.changedObs().watch()
        return this
    },

    stopWatchingforDirtyObjects: function() {
        Broadcaster.shared().removeListenerForName(this, "didChangeStoredSlot")
        //this.changedObs().stopWatching()
        return this
    },

    updateLastSyncTime: function() {
        this.setLastSyncTime(Date.now())
        return this
    },

    /*
    secondsSinceLastSync: function() {
        return (Date.now() - this.lastSyncTime())/1000
    },
    */

    descriptionForByteCount: function (b) {
        return ByteFormatter.clone().setValue(b).formattedValue()
    },

    shortStatsString: function () {
        if (!this.isOpen()) {
            return "closed"
        }
        const byteCount = this.sdb().totalBytes()
        const objectCount = this.sdb().size()
        return objectCount + " objects, " + ByteFormatter.clone().setValue(byteCount).formattedValue()
    },

    isOpen: function () {
        return this.sdb().isOpen()
    },

    asyncOpen: function (callback) {
        this.assertHasUniqueId()

        if (this.isOpen()) {
            throw new Error(this.typeId() + ".asyncOpen() already open")
        }
        
        this.sdb().setName(this.name())

        this.sdb().asyncOpen(() => {
            this.onOpen()
            //this.show()
            //this.clear()
            
            if (callback) {
                callback()
            }
            this._nodeStoreDidOpenNote.post()
        })
        return this
    },

    onOpen: function () {
        console.log(this.type() + " onOpen db size " + this.sdb().size())
        this.updateLastSyncTime()
        this.collect()
        this.startWatchingForDirtyObjects()
        return this
    },

    shared: function () {
        if (!this._shared) {
            this._shared = this.clone()
            this._shared.assertHasUniqueId()
            //this._shared.setFolder(App.shared().storageFolder().folderNamed(this.folderName())) 
        }
        return this._shared
    },

    rootInstanceWithPidForProto: function (pid, proto) {
        if (this.hasObjectForPid(pid)) {
            return this.objectForPid(pid)
        }

        const obj =  proto.clone().setPid(pid)
        this.addActiveObject(obj) 
        return obj
    },

    // ----------------------------------------------------
    // dirty objects
    // ----------------------------------------------------

    addDirtyObject: function (obj) {
        // don't use pid for these keys so we can
        // use pid to see if the obj gets referrenced when walked from a stored node
        // this way we avoid storing objects not referenced from the stored objects tree

        const dirt = this.dirtyObjects()
        const id = obj.typeId()
        if (!dirt.hasOwnProperty(id)) {

            if (obj.type() === "BMActionNode") {
                console.log("--- addDirtyObject " + obj.typeId())
            }

            dirt[id] = obj
            this.addActiveObject(obj)
            this.scheduleStore()
        }

        return this
    },

    scheduleStore: function () {
        if (!SyncScheduler.shared().isSyncingTargetAndMethod(this, "storeDirtyObjects")) {
            if (!SyncScheduler.shared().hasScheduledTargetAndMethod(this, "storeDirtyObjects")) {
                //console.warn("scheduleStore currentAction = ", SyncScheduler.currentAction() ? SyncScheduler.currentAction().description() : null)
                window.SyncScheduler.shared().scheduleTargetAndMethod(this, "storeDirtyObjects", 1000)
            }
        }
        return this
    },

    // ----------------------------------------------------
    // writing
    // ----------------------------------------------------

    hasDirtyObjects: function () {
        return Object.keys(this._dirtyObjects).length > 0
    },

    storeDirtyObjects: function () {
        this.debugLog(" --- storeDirtyObjects --- ")
        if (this.isDebugging()) {
            this.showDirtyObjects("storing")
        }

        //console.warn("   isSyncingTargetAndMethod = ", SyncScheduler.isSyncingTargetAndMethod(this, "storeDirtyObjects"))

        if (!this.hasDirtyObjects()) {
            console.log("no dirty objects to store Object.keys(this._dirtyObjects) = ", Object.getOwnPropertyNames(this._dirtyObjects))
            return this
        }

        //this.showDirtyObjects()
        //this.showActiveObjects()


        this.assertIsWritable()

        if (!this.sdb().isOpen()) {
            throw new Error(this.type() + " storeDirtyObjects but db not open")
        }

        this.debugLog(" --- begin storeDirtyObjects --- ")
        this.sdb().begin()

        // it's ok to add dirty objects via setPid() while this is
        // working as it will pick it up and won't cause a loop

        let totalStoreCount = 0

        const justStoredPids = {}

        while (true) {
            let thisLoopStoreCount = 0
            const dirtyBucket = this._dirtyObjects
            this._dirtyObjects = {}

            Object.keys(dirtyBucket).forEach((objId) => {
                const obj = dirtyBucket[objId]
                const pid = obj.pid()

                if (justStoredPids[pid]) {
                    throw new Error("attempt to double store " + pid)
                }

                //if (pid[0] === "_" || this.objectIsReferencedByActiveObjects(obj)) {
                this.storeObject(obj)
                justStoredPids[pid] = obj
                //}

                thisLoopStoreCount ++
            })

            totalStoreCount += thisLoopStoreCount
            this.debugLog(() => "totalStoreCount: " + totalStoreCount)
            if (thisLoopStoreCount === 0) {
                break
            }
        }


        this.debugLog(() => "storeDirtyObjects stored " + totalStoreCount + " objects")

        /*
		if (this.isDebugging()) {
			this.show()
		}
		*/

        this.sdb().commit() // flushes write cache
        this.updateLastSyncTime()
        this.debugLog("--- storeDirtyObjects commit ---")

        /*
		if (this.isDebugging()) {
			this.collect()
		}
		*/
        this.debugLog(" --- end storeDirtyObjects --- ")

        return totalStoreCount
    },


    assertIsWritable: function () {
        if (this.isReadOnly()) {
            throw new Error("attempt to write to read-only store")
        }
    },

    setNodeDictAtPid: function(aDict, pid) { // public API
        this.assertIsWritable()
        const serializedString = JSON.stringify(aDict)
        this.sdb().atPut(pid, serializedString)
        return this
    },

    willRefObject: function(obj) {
        if (!this.hasActiveObject(obj)) {
            this.addActiveObject(obj)
            this.addDirtyObject(obj)
        }
        return this
    },

    storeObject: function (obj) { // private API
        assert(obj.shouldStore())
        this.willRefObject(obj)

        this.debugLog(() => "storeObject(" + obj.pid() + ")")
        const aDict = obj.nodeDict()
        this.setNodeDictAtPid(aDict, obj.pid())
        return this
    },


    // ----------------------------------------------------
    // reading
    // ----------------------------------------------------

    loadObject: function (obj) {
        try {
            const nodeDict = this.nodeDictAtPid(obj.pid())
            if (nodeDict) {
                //obj.setExistsInStore(true)
                obj.setNodeDict(nodeDict)
                obj.scheduleLoadFinalize()
                return true
            }
        } catch (error) {
            this.setIsReadOnly(true)
            console.log(error.stack, "background: #000; color: #f00")
            throw error
        }

        return false
    },

    nodeDictAtPid: function (pid) { // public API
        const v = this.sdb().at(pid)
        if (Type.isNullOrUndefined(v)) {
            return null
        }
        return JSON.parse(v)
    },

    hasObjectForPid: function (pid) {
        return this.sdb().hasKey(pid)
    },

    objectForPid: function (pid) { 
        if (pid === "null") {
            return null
        }

        //console.log("NodeStore.objectForPid(" + pid + ")")

        const activeObj = this.activeObjectsDict()[pid]
        if (activeObj) {
            //this.debugLog("objectForPid(" + pid + ") - found in active objects")
            return activeObj
        }

        //this.debugLog("objectForPid(" + pid + ") - reading from store")

        const nodeDict = this.nodeDictAtPid(pid)
        if (!nodeDict) {
            const error = "NodeStore missing pid '" + pid + "'"
            console.warn("WARNING: " + error)

            // TODO: add a modal panel to allow user to choose to export and clear data
            if(!window.SyncScheduler.shared().hasScheduledTargetAndMethod(this, "clear")) {
                console.warn("WARNING: clearing database because corruption found")
                this.clear()
                window.SyncScheduler.shared().scheduleTargetAndMethod(this, "clear")
            }
            return null
            //throw new Error(error)
        }

        const nodeType = this.translateNodeType(nodeDict.type)
        const proto = window[nodeType]

        if (!proto) {
            throw new Error("missing proto '" + nodeDict.type + "'")
        }

        const obj = proto.clone()

        // need to set pid before dict to handle circular refs
        obj.setPid(pid)
        this.addActiveObject(obj)

        this.debugLog(() =>  "objectForPid(" + pid + ") nodeDict = " + JSON.stringify(nodeDict, null, 2))
        obj.setNodeDict(nodeDict)
        obj.scheduleLoadFinalize()

        return obj
    },

    // ----------------------------------------------------
    // active objects (the read cache)
    // ----------------------------------------------------

    // active objects - ones we've read or written to disk
    // we use a dictionary to track the pids and a WeakMap
    // to connect each pid to a object

    hasActiveObject: function(obj) {
        return !Type.isUndefined(this.activeObjectsDict()[obj.pid()])
    },

    addActiveObject: function (obj) {
        if (!this.hasActiveObject(obj)) {
            const pid = obj.pid()

            if (obj.type() === "BMStunServers") {
                console.log("---")
            }
            
            this.debugLog(() => "addActiveObject(" + obj.pid() + ")")
            assert(!Type.isNullOrUndefined(pid))
            this.activeObjectsDict()[pid] = obj
        }
        return this
    },

    removeActiveObject: function (obj) {
        const pid = obj.pid()
        assert(!Type.isNullOrUndefined(pid))
        delete this.activeObjectsDict()[pid]
        return this
    },

    /*
    writeAllActiveObjects: function () {
        const activeObjects = Object.slotValues(this.activeObjectsDict())
        activeObjects.forEach((obj) => {
            this.storeObject(obj)
        })
        return this
    },
    */

    // references
    //
    //      valid form:
    // 
    //          { <objRefKey>: "<pid>" }
    //
    //      if pid === "null" then object is null
    //

    refValueIfNeeded: function (v) {
        if (Type.isObject(v)) {
            if (Type.isNull(v) || Type.isFunction(v.type)) {
                return this.refForObject(v)
            }
        }
        return v // assumes arrays and dictionaries don't reference Proto instances?
    },

    pidIfRef: function (ref) {
        if (Type.isObject(ref)) {
            if (this.dictIsObjRef(ref)) {
                return ref[this.objRefKey()]
            }
        }
        return null
    },

    unrefValueIfNeeded: function (v) {
        const pid = this.pidIfRef(v)

        if (pid) {
            return this.objectForPid(pid)
        }

        return v
    },

    objRefKey: function () {
        return "pid"
    },

    dictIsObjRef: function (dict) {
        const k = this.objRefKey()
        return Type.isString(dict[k])
    },

    refForObject: function (obj) {
        const k = this.objRefKey()
        const ref = {}

        if (Type.isNull(obj) || !obj.shouldStore()) { // TODO: is this right?
            ref[k] = "null"
        } else if (Type.isObject(obj)) {
            assert(obj.shouldStore())
            this.willRefObject(obj)
            ref[k] = obj.pid()
        } else {
            throw new Error("can't get refForObject(", obj, ")")
        }

        return ref
    },

    objectForRef: function (ref) {
        const k = this.objRefKey()
        const pid = ref[k]
        if (pid === "null") {
            return null
        }

        return this.objectForPid(pid)
    },

    nodeTypeTranslationDict: function() {
        // TODO: make this a slot so app can set it on startup
        return {
            //"BMDatedSet": "BMStoredDatedSetNode",
        }
    },

    translateNodeType: function(typeName) {
        const dict = this.nodeTypeTranslationDict();
        const v = dict[typeName];
        return v ? v : typeName;
    },

    pidRefsFromPid: function (pid) {
        // TODO: change to directly inspect?
        // direct inspections might help for cases where proto is removed?

        const nodeDict = this.nodeDictAtPid(pid)
        if (!nodeDict) {
            console.log("WARNING: called pidRefsFromPid(" + pid + ") but pid not found")
            return []
        }

        const nodeType = this.translateNodeType(nodeDict.type)

        let proto = window[nodeType]
        if (!proto) {
            console.warn(this.type() + "pidRefsFromPid(" + pid + ") missing type " + nodeDict.type)
            proto = BMStorableNode
        }

        return proto.nodePidRefsFromNodeDict(nodeDict)
    },

    /*
    pidRefsFromNodeDict: function(nodeDict) {
        const pids = []

        if (nodeDict) {
            // property pids

			Object.keys(nodeDict).forEach((k) => {

                    const v = nodeDict[k]
                    const childPid = this.pidIfRef(v)
                    if (childPid) {
                        pids.push(childPid);
                    }
            })
            
            // child pids
            if (nodeDict.children) {
                nodeDict.children.forEach(function(childPid) {
                    pids.push(childPid)
                })
            }          
        }
        
        return pids
    },
    */

    // ----------------------------------------------------
    // garbage collection
    // ----------------------------------------------------

    rootPids: function () {
        // pids beginning with _ are considered root
        // to delete them you'll need to call removeEntryForPid()

        return this.sdb().keys().select(pid => pid[0] === "_")
    },

    flushIfNeeded: function () {
        if (this.hasDirtyObjects()) {
            this.storeDirtyObjects()
            assert(!this.hasDirtyObjects())
        }
        return this
    },

    collect: function () {
        // this is an on-disk collection
        // in-memory objects aren't considered
        // so we make sure they're flush to the db first 

        this.flushIfNeeded()

        this.debugLog("--- begin collect ---")

        this._marked = {}

        this.rootPids().forEach((rootPid) => {
            this.markPid(rootPid) // this is recursive, but skips marked records
        })

        //this.markActiveObjects() // not needed if assert(!this.hasDirtyObjects()) is above

        const deleteCount = this.sweep()
        this._marked = null
        this.debugLog(() => "--- end collect - collected " + deleteCount + " pids ---")
        return deleteCount
    },

    markActiveObjects: function () {
        const marked = this.marked()
        this.activeObjectsDict().forEachKV((k, v) => { marked[k] = true })
        return this
    },

    markPid: function (pid) {
        if (pid === "null") {
            return this
        }
        //this.debugLog(() => "markPid(" + pid + ")")
        if (this._marked[pid] === true) {
            return false // already marked it
        }
        this._marked[pid] = true

        const refPids = this.pidRefsFromPid(pid)
        this.debugLog(() => "markPid " + pid + " w refs " + JSON.stringify(refPids))
        refPids.forEach(refPid => this.markPid(refPid))
        return this
    },

    sweep: function () {
        this.debugLog("--- sweep --- ")
        // delete all unmarked records
        this.sdb().begin()

        let deleteCount = 0
        const pids = this.sdb().keys()

        pids.forEach((pid) => {
            if (this._marked[pid] !== true) {
                this.debugLog(() => " sweep deletePid(" + pid + ")")
                this.sdb().removeAt(pid)
                deleteCount ++
            }
        })

        this.sdb().commit()

        return deleteCount
    },

    justRemovePid: function (pid) { // private
        this.sdb().begin()
        this.sdb().removeAt(pid)
        this.sdb().commit()
        return this
    },

    // transactions

    begin: function () {
        throw new Error("transactions not implemented yet")

    },

    commit: function () {
        throw new Error("transactions not implemented yet")
    },

    asJson: function () {
        return this.sdb().asJson()
    },

    clear: function () {
        console.warn("====================================")
        console.warn("=== NodeStore clearing all data! ===")
        console.warn("====================================")
        //throw new Error("NodeStore clearing all data!")
        this.sdb().clear();
    },

    show: function () {
        console.log("--- NodeStore show ---")
        this.rootPids().forEach((pid) => {
            this.showPid(pid, 1, 3)
        })
        console.log("----------------------")
        //this.sdb().idb().show()
        return this
    },

    // --- debugging helper methods ---

    showPid: function (pid, level, maxLevel) {
        if (level > maxLevel) {
            return
        }

        const stringReplacer = function (value) {
            if (typeof(value) === "string" && value.length > 100) {
                return value.substring(0, 100) + "...";
            }
            return value
        }

        const replacer = function (key, value) {
            value = stringReplacer(value)

            if (typeof(value) === "array") {
                return value.map(stringReplacer)
            }
            return value;
        }

        const indent = "   ".repeat(level)
        const nodeDict = this.nodeDictAtPid(pid)
        console.log(indent + pid + ": " + JSON.stringify(nodeDict, replacer, 2 + indent.length))

        if (!Type.isNullOrUndefined(nodeDict) && nodeDict.children) {
            nodeDict.children.forEach((childPid) => {
                this.showPid(childPid, level + 1, maxLevel)
            })
        }
        return this
    },

    showDirtyObjects: function (prefixString = "") {
        const dirty = this._dirtyObjects
        const s = dirty.mapToArrayKV((k, v) => "'" +k + "' : '" + v.typeId() + "'").join("\n")
        console.log(prefixString + " dirty objects: \n" + s)
        return this
    },

    /*
    showActiveObjects: function () {
        const active = this.activeObjectsDict()
        console.log("active objects: ")

        Object.keys(active).forEach((pid) => {
            const obj = active[pid]
            console.log("    " + pid + ": ", Object.keys(obj.nodeRefPids()))
        })

        const pid = "_localIdentities"
        const obj = active[pid]
        console.log("    " + pid + ": ", Object.keys(obj.nodeRefPids()))
        return this
    },

    objectIsReferencedByActiveObjects: function (aNode) {
        const nodePid = aNode.pid()
        const active = this.activeObjectsDict()

        const result = Object.keys(active).detect((pid) => {
            const obj = active[pid]
            const match = (!(obj === aNode)) && obj.nodeReferencesPid(nodePid)
            return match
        }) !== null

        if (!result) {
            //console.log(">>>>>> " + aNode.pid() + " is unreferenced - not storing!")
        }
        return result
    },
    */
})
