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
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
        this.setRoot(null)
        this.setPidToDict({})
        this.setPidToObject({})
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

    nodeDictAtPid: function(pid) {
        const nodeDict = this.pidToDict()[pid]
        return nodeDict
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
        obj.setExistsInStore(true)
        obj.setNodeDict(nodeDict)
        obj.scheduleLoadFinalize()

        return obj
    },

})
