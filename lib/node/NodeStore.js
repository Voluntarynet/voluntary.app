/*
    NodeStore: an JSON object database 
    stores objects as dictionaries in individual JSON files in a single folder
    
    Overview:
    
        When the program starts, it should tell the store which object it wants to use
        as the root (for the persistence garbage collector):
 
                var root = BMNode.clone()
                NodeStore.shared().setRootObject(root)
                
        Whenever a BNNode instanceis created, it's init method tells the store of 
        it's existence ( addActiveObject(aNode) ) and mark itself as dirty.
        
        All dirty objects are persisted on the next event loop. When an item
        creates the children in it's nodeDict, if the 
    
    
    Limitations: 
    
        code currenlty assumes < 100K objects stored at a given time
        and that each object is typically a few K and rarely more than a few MB
    
    How it works: 
    
        Persistent ids:
    
        each object is assigned a _pid property when persisted 
        _pid is a unique (persistent id) number for the object
        an object's item name is the pid number
    
        if a dictionary value points to string or number, it's value is stored in json
        otherwise, it's value is stored as a pid reference in a dictionary 
        like { _pid: pidNum }. 
    
    Writing and reading objects:
    
        storable objects must define nodeDict() and setNodeDict(aDict) methods
        a nodeDict is JSON dict and contains a type slot which contains the object type name
        such that:
    
            window[typeName].clone().setNodeDict(nodeDict)
        
        can be used to unserialize the object. Object's are responsible for unserializing 
        the nodeDict. The NodeStore.refForObject(obj) and NodeStore.objectForRef(refDict) can be used
        to contruct refs and derefence them as needed.

        Example use:
    
                var store = NodeStore.clone().setFolder(Folder.clone().setPath("..."))
            
            // need to define a root
            
                var root = BMNode.clone()
                store.setRootObject(root)
                store.load()
            
            // when you modify any BMNode instance's items or data slots, 
            // or call markDirty() on it, it will be marked as needing to be persisted in the
            // next event loop
            
                var test = BMNode.clone()
                root.addItem(test) // this marks root as dirty
                test.addItem(foo) // this marks test as dirty
                        
            // for singular objects, set their pid to a unique name, e.g.
            
                servers.setPid("_servers")
        
            
            // when ready to store
            
                store.store()
            
            
    
    Garbage collection
    
        Periodically (e.g. when opening/closing an app) you'll want to delete any unreferenced
        object records to make sure they don't use up too much space. To do this call:
    
            pdb.collect()
    
    Issues:
    
        deal with loading circular refs
        - need to add to pid list before linking children or ivars that ref objects
        but what if we call a setter which does some validation on the object set?
        the object wouldn't be valid until we finished loading it...
*/

//var fs = require('fs');
//var path = require('path')

// -----------------------------------------------

/*
ideal.Proto.pdbWatchSlot = function(name) {
 	var privateName = "_" + name;
	this["set" + name.capitalized()] = function(newValue)
	{
	    this[privateName] = newValue;
        NodeStore.shared().addDirtyObject(this)
		return this;
	}
}

ideal.Proto.pdbUnwatchSlot = function(name) {
 	var privateName = "_" + name;
	this["set" + name.capitalized()] = function(newValue)
	{
	    this[privateName] = newValue;
		return this;
	}
}
*/

// -----------------------------------------------

//NodeStore.shared().setFolder(window.app.storageFolder().folderNamed("pdb"))   

NodeStore = ideal.Proto.extend().newSlots({
    type: "NodeStore",
    folderName: "NodeStore",
    folder: null,
    rootObject: null,
    
    dirtyObjects: null,
    hasTimeout: false,
    
    activeObjectsDict: null,
    storingObjects: null,
    debug: false,
}).setSlots({
    init: function () {
        this.setDirtyObjects([])
        this.setActiveObjectsDict({})
    },
    
    shared: function() {
        if (!this._shared) {
            this._shared = this.clone()
            //this._shared.setFolder(window.app.storageFolder().folderNamed(this.folderName())) 
            console.log("localStorage = ", this.asJson())
        }
        return this._shared
    },
    
    setFolder: function(aFolder) {
        this._folder = aFolder
        this._folder.createIfAbsent()
        this._countFile = null
        return this
    },
    
    // dirty objects
    
    addDirtyObject: function(obj) {
        // dirty objects list won't be huge, so a list is ok
        
        if (!this._dirtyObjects.contains(obj)) {
            this._dirtyObjects.push(obj)
            this.setTimeoutIfNeeded()
        }
        
        return this
    },
    
    setTimeoutIfNeeded: function() {
        if (!this._hasTimeout) {
            this._hasTimeout = true
            var self = this
            setTimeout(function () { 
                self._hasTimeout = false
                self.storeDirtyObjects() 
            }, 10)
        }
        
        return this
    },
        
    // writing
    
    debugLog: function(s) {
        if (this.debug()) {
            console.log(s)
        }
    },
    
    storeDirtyObjects: function() {
        // it's ok to add dirty objects via setPid() while this is
        // working as it will pick it up and won't cause a loop
        
        //console.log("NodeStore.storeDirtyObjects")
        var storeCount = 0
        
        while (true) {
            var obj = this._dirtyObjects.pop()
            if (obj) {
                this.storeObject(obj)
                storeCount ++
            } else {
                break; 
            }
        }
        
        this.debugLog("NodeStore.storeDirtyObjects stored " +  storeCount + " objects")
        return storeCount
    },
    
    newUUID: function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    },

    pidOfObj: function(obj) {
        if (!("_pid" in obj) || obj._pid == null) {
            obj._pid = obj.type() + "_" + this.newUUID()
        }   
        return obj._pid     
    },
    
    hasRecordForObject: function(obj) {
        return localStorage.getItem(obj.pid()) != null
    },
    
    storeObject: function(obj) {
        localStorage.setItem(obj.pid(), JSON.stringify(obj.nodeDict()))
        this.debugLog("storeObject(" + obj.pid() + ")")
        
        /*
        this happens automatically 
        - when item pids are requested for serialization, 
        they are added to dirty when pid is assigned
        
        var self = this
        obj.items().forEach(function (item) {
            self.storeObjectIfAbsent(item)
        })
        this.addActiveObject(obj)
        */
        
        return this
    },
    
    /*
    fileAtPid: function(pid) {
        return this.folder().fileNamed(pid)       
    },
    */
    
    // reading
    
    loadObject: function(obj) {
        var nodeDict = this.nodeDictAtPid(obj.pid())
        if (nodeDict) {
            obj.setNodeDict(nodeDict)
            return true
        }
        
        return false
    },
    
    justReadChildrenOfObject: function(obj) {
        var nodeDict = this.nodeDictAtPid(obj.pid())
        if (nodeDict) {
            obj.setNodeDictForChildren(nodeDict)
            return true
        }
        
        return false        
    },
 
    // root
    
    setRootObject: function(obj) {
        this.collect()
        this._rootObject = obj
        obj.setPid("_root")
        obj.loadIfPresent()
        
        // to ensure we'll save it if it's the first time
        // should we check if present?
        // if (!this.hasRecordForObject(obj)) {
        obj.markDirty() 
        // }
        
        return this
    },
    
    load: function() {
        this.debugLog("read root")
        this.loadObject(this.rootObject())  
        return this      
    },
    
    store: function() {
        this.debugLog("store root")
        this.storeObject(this.rootObject())        
        return this      
    },
    
    nodeDictAtPid: function(pid) {
        var v = localStorage.getItem(pid)
        if (v == null) { 
            return null 
        }        
        return JSON.parse(v)
    },
    
    objectForPid: function(pid) {
        if (pid == "null") {
            return null
        }
        
        var obj = this.activeObjectsDict()[pid]
        if (obj) {
            //this.debugLog("objectForPid(" + pid + ") found in mem")
            return obj
        }

        //this.debugLog("objectForPid(" + pid + ")")
        
        var nodeDict = this.nodeDictAtPid(pid)
        if (!nodeDict) {
            throw new Error("missing pid '" + pid + "'")
        }
        
        var proto = window[nodeDict.type]
        if (!proto) {
            throw new Error("missing proto '" + nodeDict.type + "'")
        }
        var obj = proto.clone()
        // need to set pid before dict to handle circular refs
        obj.setPid(pid) 
        obj.setNodeDict(nodeDict)
        return obj
    },
    
    // active objects - one's we've read or written to disk
    // we use a dictionary to track the pids and a WeakMap
    // to connect each pid to a object
    
    addActiveObject: function(obj) {
        //this.debugLog("addActiveObject(" + obj.pid() + ")")
        this.activeObjectsDict()[obj.pid()] = obj        
        return this
    },
    
    removeActiveObject: function(obj) {
        delete this.activeObjectsDict()[obj.pid()]
        return this
    },

    writeAllActiveObjects: function() {
        var self = this
        this.activeObjectsDict().slotValues().forEach(function(obj) {
            self.storeObject(obj)
        })
        return this
    },

    // references
    //
    //      valid form:
    // 
    //          { <objRefKey>: "<pid>" }
    //
    //      if pid == "null" then object is null
    //
    
    refValueIfNeeded: function(v) {
        if (typeof(v) == "object") {
            if (v == null || typeof(v.type) == "function") {
                return this.refForObject(v)
            }
        }
        return v
    },
    
    pidIfRef: function(ref) {
        if (typeof(ref) == "object") {
            if (this.dictIsObjRef(ref)) {
                return ref[this.objRefKey()]
            }
        }
        return null        
    },
    
    unrefValueIfNeeded: function(v) {
        var pid = this.pidIfRef(v)
        
        if (pid) {
            return this.objectForPid(pid)
        }
        
        return v
    },
    
    objRefKey: function () {
        return "pid"
    },
    
    dictIsObjRef: function(dict) {
        var k = this.objRefKey()
        return typeof(dict[k]) == "string" 
    },
    
    refForObject: function(obj) {
        var k = this.objRefKey()
        var ref = {}
        
        if(obj === null && typeof(obj) === "object") {
            ref[k] = "null"
        } else {
            ref[k] = obj.pid()
        }
        
        return ref
    },
    
    objectForRef: function(ref) {
        var k = this.objRefKey()
        var pid = ref[k]
        if (pid == "null") {
            return null
        } 

        return this.objectForPid(pid)
    },
    
    pidRefsFromPid: function(pid) {
        var pids = []

        var nodeDict = this.nodeDictAtPid(pid)
        
        if (nodeDict) {
            // property pids
            for (var k in nodeDict) {
                if (this.hasOwnProperty(k)) {
                    var childPid = this.pidIfRef(nodeDict[v])
                    if (childPid) {
                        pids.push(childPid);
                    }
                }
            }
            
            // child pids
            if (nodeDict.children) {
                nodeDict.children.forEach(function(childPid) {
                    pids.push(childPid)
                })
            }          
        }
        
        return pids
    },
    
    // garbage collection
    
    collect: function() {
        // this is an on-disk collection
        // in-memory objects aren't considered
        
        this.debugLog("--- begin collect ---")
        this._marked = {}
        this.markPid("_root")
        var deleteCount = this.sweep()
        this._marked = null
        //if (deleteCount) {
            this.debugLog("--- end collect - collected " + deleteCount + " pids ---")
        //}
        return deleteCount
    },
    
    markPid: function(pid) {
        this.debugLog("markPid(" + pid + ")")
        
        if (this._marked[pid] == true) { 
            // already marked it
            return 
        }
        this._marked[pid] = true
                
        var self = this
        var childPids = this.pidRefsFromPid(pid)
       // console.trace(pid + " refs " + JSON.stringify(childPids))
        
        childPids.forEach(function(childPid) {
            self.markPid(childPid)
        })
    },
    
    sweep: function() {
        // delete all unmarked files
        var self = this
        var deleteCount = 0
        
        for (var i = localStorage.length; i > -1; i--)  {
           var pid = localStorage.key(i)
            if (self._marked[pid] != true) {
                self.debugLog("deletePid(" + pid + ")")
                localStorage.removeItem(pid)
                deleteCount ++
            }            
        }
        /*
        var pidFiles = this.folder().files()
        pidFiles.forEach(function(file) {
            var pid = file.name()
            if (self._marked[pid] != true) {
                self.debugLog("deletePid(" + pid + ")")
                file.delete()
                deleteCount ++
            } 
        })
        return
        */ deleteCount
    },
    
    // transactions
    
    begin: function() {
        
        
    },
    
    commit: function() {
        
    },
    
    asJson: function() {
        var dict = {}
        
        for (var i = localStorage.length; i > -1; i--)  {
           var pid = localStorage.key(i)
           dict[pid] = localStorage.getItem(pid)    
        }
        return dict
    },
    
    clear: function() {
        console.log("NodeStore clearing all data!")
        localStorage.clear();
    }
})
