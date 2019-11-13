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


// need a pidRefsFromPid

ideal.Proto.newSubclassNamed("SimpleStore").newSlots({
    rootObject: null, 
    recordsDict: null, // dict
    activeObjects: null, // dict
    storeQueue: null, // array 
    //isReadOnly: true,
}).setSlots({
    init: function() {
        ideal.Proto.init.apply(this)
        this.setRootObject(null)
        this.setRecordsDict({})
        this.setActiveObjects({})
        this.setStoreQueue([])
        return this
    },

    asJson: function() {
        this.processStoreQueue()
        return JSON.stringify(this.recordsDict(), null, 2)
    },

    hasActiveObject: function(anObject) {
        const puuid = anObject.puuid()
        return this.activeObjects().hasOwnProperty(puuid)
    },

    addActiveObject: function(anObject) {
        if (!this.hasActiveObject(anObject)) {
            this.storeQueue().push(anObject) // only do this during ref creation?
        }
        this.activeObjects()[anObject.puuid()] = anObject
    },

    processStoreQueue: function() {
        while (this.storeQueue().length) {
            this.processNextStoreQueue()
        }
    },

    processNextStoreQueue: function() {
        const obj = this.storeQueue().shift() // pop's first item
        this.storeObject(obj)
    },

    recordForPid: function(puuid) {
        return this.recordsDict()[puuid]
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

        if (!this.hasActiveObject(obj)) {
            this.addDirtObject(obj)
        }

        this.addActiveObject(v)
        const ref = { "*": v.puuid() }
        return ref
    },

    storeObject: function(obj) {
        const puuid = obj.puuid()
        assert(puuid)
        this.recordsDict()[puuid] = obj.recordForStore(this)
        this.processStoreQueue()
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

    simpleStore.storeObject(node)
    console.log(simpleStore.asJson())

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


