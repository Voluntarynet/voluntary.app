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
        if (Type.isNumber(v) || Type.isString(v) || Type.isNull(v)) {
            return v
        }

        if (Type.isFunction(v)) {
            throw new Error("unable to store functions")
        }

        if (v.type && Type.isFunction(v.type)) { // TODO: check if BMNode subclass instead
            this.addActiveObject(v)
            return { "_pid": v.pid() }
        }

        return null
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
