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
            const poolJson = ObjectPool.clone().setRoot(rootNode).toJson()
            
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


ideal.Proto.newSubclassNamed("ObjectPool").newSlots({
    rootObject: null,
    puuidToDict: null,
    puuidToObject: null,
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
        json.rootPid = this.root().puuid()
        this.root().storeToPool(this)
        return json
    }, 

    fromJson: function(json) {
        this.setPidToDict(json.puuidToDict)
        const obj = this.objectForPid(json.rootPid)
        this.setRootObject(obj)
        return this
    },

    // dirty objects

    addDirtyObject: function(anObject) {
        this.dirtyObjectsDict()[anObject.puuid()] = anObject
        return this
    },

    // get/set nodeDict for puuid

    setNodeDictAtPid: function(dict, puuid) {
        
        return this
    },

    nodeDictAtPid: function(puuid) {
        const nodeDict = this.puuidToDict()[puuid]
        return nodeDict
    },

    hasObjectForPid: function(puuid) {
        return puuid in this.puuidToObject()
    },

    // objects and refs

    refForValue: function(v) {
        if(v.toJsonValueForStore(this)) {
            // nodes return puuid refs
            // { type: "ObjectRef", puuid: "xxx" },
            // { type: }

        }

        if (Type.isLiteral(v)) {
            return v
        }

        if (Type.isFunction(v)) {
            throw new Error("unable to store functions")
        }

        if (Type.isArray(v)) {
            
        }

        if (Type.isObject(v) && v.type && Type.isFunction(v.type)) { // TODO: check if BMNode subclass instead
            this.addActiveObject(v)
            return { "_puuid_": v.puuid() }
        }

        throw new Error("unable to store this data type")
    },

    objectForPid: function(puuid) {
        const cachedbject = this.puuidToObject()[puuid]
        if (cachedbject) {
            return cachedbject
        }

        const nodeDict = this.nodeDictAtPid(puuid)
        const type = nodeDict.type
        const proto = window[type]

        if (!proto) {
            throw new Error("missing proto '" + nodeDict.type + "'")
        }

        const obj = proto.clone()
        this.puuidToObject()[puuid] = object

        obj.justSetPid(puuid) // calls addActiveObject()?
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
        const puuid = anObject.puuid()
        if (!this._activeObjects[puuid]) {
            this._storeQueue.push(anObject)
        }
        this._activeObjects[anObject.puuid()] = anObject
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

    recordForPid: function(puuid) {
        return this._recordsDict[puuid]
    },

    objectForRecord: function(aRecord) {
        const aClass = window[aRecord.type]
        const obj = aClass.instanceFromRecordInStore(aRecord, this)
        return obj
    },

    objectForPid: function(puuid) {
        /*
        const obj = this._activeObjects[puuid]
        if (obj) {
            return obj
        }
        */
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
        const puuid = v.puuid()
        assert(puuid)
        this.addActiveObject(v)
        return { 
            // type: Type.typeName(v), // what about subclasses?
            "*": v.puuid()
        }
    },

    storeObject: function(obj) {
        const puuid = obj.puuid()
        assert(puuid)
        this._recordsDict[puuid] = obj.recordForStore(this)
        this.processStoreQueue()
        return this
    },

}

// --- object puuid ---

Object.uuid = function() {
    const uuid_a = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
    const uuid_b = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
    return uuid_a + uuid_b
}

Object._puuidWeakMap = new WeakMap();

Object.prototype.puuid = function() {
    const map = Object._puuidWeakMap

    if (!map.has(this)) {
        this.setPid(Object.uuid())
    }

    return map.get(this);
}

Object.prototype.setPid = function(puuid) {
    Object._puuidWeakMap.set(this, puuid);
    return this
}

/*
Object.prototype.typeId = function() {
    const puuid = this.puuid()
    if (Type.isFunction(this.type)) {
        return this.type() + puuid
    }
    return Type.typeName(this) + "_" + puuid
}
*/

// ------------------

Type.typedArrayTypeNames().forEach((name) => {
    window[name].prototype.recordForStore = function(aStore) { // should only be called by Store
        return {
            type: Type.typeName(this), 
            length: this.length,
            values: this.values() // this is an iterator
        }
    }
    
    window[name].instanceFromRecordInStore = function(aRecord, aStore) { // should only be called by Store
        const values = aRecord.values
        const obj = new this(values)
        return obj
    }
})

// ------------------

Date.prototype.recordForStore = function(aStore) { // should only be called by Store
    return {
        type: "Date", 
        v: this.toJSON()
    }
}

Date.instanceFromRecordInStore = function(aRecord, aStore) { // should only be called by Store
    assert(aRecord.type === "Date")
    return new Date(new Date(aRecord.v))
}

// ------------------

Array.prototype.recordForStore = function(aStore) { // should only be called by Store
    return {
        type: Type.typeName(this), 
        v: this.map(v => aStore.refValue(v))
    }
}

Array.instanceFromRecordInStore = function(aRecord, aStore) { // should only be called by Store
    assert(aRecord.type === "Array")
    return aRecord.v.map(v => aStore.unrefValue(v))
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

/*
TypedArray
Int8Array
Uint8Array
Uint8ClampedArray
Int16Array
Uint16Array
Int32Array
Uint32Array
Float32Array
Float64Array
BigInt64Array
BigUint64Array
*/

// -------------------

const test = function () {
    const simpleStore = SimpleStore

    const fa = new Float64Array(3)
    fa[0] = 1.2
    fa[1] = 3.4
    fa[1] = 5.6

    const a = [1, 2, [3, null], { foo: "bar", b: true }, new Date(), fa]

    
    const aSerialized = JSON.stringify(a, null, 2)
    console.log("aSerialized: " + aSerialized + "\n")
    SimpleStore.storeObject(a)

    console.log(simpleStore.asJson())
    console.log("-----------------")

    const b = SimpleStore.objectForPid(a.puuid())
    const bSerialized = JSON.stringify(b, null, 2)
    console.log("bSerialized: " + bSerialized + "\n")
    assert(aSerialized === bSerialized)
    console.log("test passed")
}

test()


