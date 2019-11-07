"use strict"

/*

    ObjectPool

        For persisting a node tree to JSON and back.
        Usefull for exporting nodes out the the app/browser
        and into others.

        JSON format:

            {
                rootPid: "rootPid",
                pidToDict: {
                    "objPid" : <nodeDict>
                }

            }

        Example use:
    
            // converting a node to json
            const poolJson = ObjectPool.clone().setRoot(rootNode).toJson()
            
            // converting json to a node
            const rootNode = ObjectPool.clone().fromJson(poolJson).root()


    Some values can be directly stored in JSON such as:

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

    BMNode needs to be referenced by a pid and the Store needs to know it needs to be written if not already present.

    If an entry value is not a {}, then we treat it as the value. 
    If it is a {}. then we decode it.

    Entry formats:

        ["key", rawValue]
        ["key", "Type", encodedValue]

    Specific examples:

        ["key", "BMStorableNode", "<pid>"]
        ["key", "Array", [x, y, z]]

*/


ideal.Proto.newSubclassNamed("ObjectPool").newSlots({
    rootObject: null,
    pidToDict: null,
    pidToObject: null,
    dirtyObjectsDict: null,
    isReadOnly: true,
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
        this.setRoot(null)
        this.setPidToDict({})
        this.setPidToObject({})
        this.setDirtyObjectsDict({})
    },

    toJson: function() {
        assert(this.root())
        const json = {}
        json.rootPid = this.root().pid()
        this.root().storeToPool(this)
        return json
    }, 

    fromJson: function(json) {
        this.setPidToDict(json.pidToDict)
        const obj = this.objectForPid(json.rootPid)
        this.setRootObject(obj)
        return this
    },

    // dirty objects

    addDirtyObject: function(anObject) {
        this.dirtyObjectsDict()[anObject.pid()] = anObject
        return this
    },

    // get/set nodeDict for pid

    setNodeDictAtPid: function(dict, pid) {
        
        return this
    },


    nodeDictAtPid: function(pid) {
        const nodeDict = this.pidToDict()[pid]
        return nodeDict
    },

    hasObjectForPid: function(pid) {
        return pid in this.pidToObject()
    },

    // objects and refs

    refForValue: function(v) {
        if(v.toJsonValueForStore(this)) {
            // nodes return pid refs
            // { type: "ObjectRef", pid: "xxx" },
            // { type: }

        }

        if ( Type.isBoolean(v) || Type.isNumber(v) || Type.isString(v) || Type.isNull(v) || Type.isSymbol(v) ) {
            return v
        }

        if (Type.isFunction(v)) {
            throw new Error("unable to store functions")
        }

        if (Type.isArray(v)) {
            
        }

        if (Type.isObject(v) && v.type && Type.isFunction(v.type)) { // TODO: check if BMNode subclass instead
            this.addActiveObject(v)
            return { "_pid_": v.pid() }
        }

        throw new Error("unable to store this data type")
    },

    objectForPid: function(pid) {
        const cachedbject = this.pidToObject()[pid]
        if (cachedbject) {
            return cachedbject
        }

        const nodeDict = this.nodeDictAtPid(pid)
        const type = nodeDict.type
        const proto = window[type]

        if (!proto) {
            throw new Error("missing proto '" + nodeDict.type + "'")
        }

        const obj = proto.clone()
        this.pidToObject()[pid] = object

        obj.justSetPid(pid) // calls addActiveObject()?
        this.addActiveObject(obj)
        obj.setExistsInStore(true)
        obj.setNodeDict(nodeDict)
        obj.scheduleLoadFinalize()

        return obj
    },

    addActiveObject: function(obj) {
        return this
    },

})

// ---------------------------------------------------------------------------------------

const SimpleStore = {
    _recordsDict: {},
    _activeObjects: {},
    _storeQueue: [],

    asJson: function() {
        this.processStoreQueue()
        return JSON.stringify(this._recordsDict, null, 2)
    },

    addActiveObject: function(anObject) {
        const pid = anObject.pid()
        if (!this._activeObjects[pid]) {
            this._storeQueue.push(anObject)
        }
        this._activeObjects[anObject.pid()] = anObject
    },

    processStoreQueue: function() {
        while (this._storeQueue.length) {
            this.processNextStoreQueue()
        }
    },

    processNextStoreQueue: function() {
        const obj = this._storeQueue.shift() // pop's first item
        this.storeObject(obj)
    },

    recordForPid: function(pid) {
        return this._recordsDict[pid]
    },

    objectForRecord: function(aRecord) {
        return window[aRecord.type].instanceFromRecordInStore(aRecord, this)
    },

    objectForPid: function(pid) {
        /*
        const obj = this._activeObjects[pid]
        if (obj) {
            return obj
        }
        */
        return this.objectForRecord(this.recordForPid(pid))
    },

    unrefValue: function(v) {
        if (Type.isLiteral(v)) {
            return v
        }
        const pid = v.__pid__
        assert(pid)
        return this.objectForPid(pid)
    },

    refValue: function(v) {
        if (Type.isLiteral(v)) {
            return v
        }
        const pid = v.pid()
        assert(pid)
        this.addActiveObject(v)
        return { 
            type: Type.description(v), // what about subclasses?
            __pid__: v.pid()
        }
    },

    storeObject: function(obj) {
        const pid = obj.pid()
        assert(pid)
        this._recordsDict[pid] = obj.recordForStore(this)
        this.processStoreQueue()
        return this
    },

}

// --- object pid ---

Object.uuid = function() {
    const uuid_a = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
    const uuid_b = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
    return uuid_a + uuid_b
}

Object._pidWeakMap = new WeakMap();

Object.prototype.pid = function() {
    const map = Object._pidWeakMap

    if (!map.has(this)) {
        this.setPid(Object.uuid())
    }

    return map.get(this);
}

Object.prototype.setPid = function(pid) {
    Object._pidWeakMap.set(this, pid);
    return this
}

// ------------------

Array.prototype.recordForStore = function(aStore) { // should only be called by Store
    return {
        type: Type.description(this), 
        value: this.map(v => aStore.refValue(v))
    }
}

Array.instanceFromRecordInStore = function(aRecord, aStore) { // should only be called by Store
    assert(aRecord.type === "Array")
    return aRecord.value.map(v => aStore.unrefValue(v))
}

// ------------------

Object.prototype.recordForStore = function(aStore) { // should only be called by Store
    const dict = {}

    Object.getOwnPropertyNames(this).forEach((k) => {
        const v = this[k]
        dict[k] = aStore.refValue(v)
    })

    return {
        type: "Object", 
        dict: dict, 
    }
}

Object.instanceFromRecordInStore = function(aRecord, aStore) { // should only be called by Store
    assert(aRecord.type === "Object")
    
    const obj = {}
    const dict = aRecord.dict

    Object.getOwnPropertyNames(dict).forEach((k) => {
        const v = dict[k]
        obj[k] = aStore.unrefValue(v)
    })
    return obj
}

// -------------------


const test = function () {
    const simpleStore = SimpleStore
    const a = [1, 2, [3, null], { foo: "bar"}]

    const aSerialized = JSON.stringify(a, null, 2)
    console.log("aSerialized: " + aSerialized + "\n")
    SimpleStore.storeObject(a)
    console.log(simpleStore.asJson())
    const b = SimpleStore.objectForPid(a.pid())
    const bSerialized = JSON.stringify(b, null, 2)
    console.log("bSerialized: " + bSerialized + "\n")
    assert(aSerialized === bSerialized)
    console.log("test passed")
}


test()


