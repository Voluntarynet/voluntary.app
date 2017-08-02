/*
    NodeStore: a JSON object database with automatic garbage collection 
	and syncing on event cycle via marking objects as dirty and only writing each once
	
    stores objects as dictionaries in individual JSON files in a single folder
    
    Overview:
    
		The collector can have multiple roots. Any object stored with a pid (persistent Id) that begins
		with an underscore will be treated as a root object and always marked when collecting garbage.
		
        Example:
 
				var people = NodeStore.rootInstanceWithPidForProto("_people", PeopleNode) 
		
		This instantiates the object if it's not persisted, loads it if it is, and returns any already 
		unpersisted instance if there is one.
				
				people.loadIfPresent() // will add it to active objects list if missing?
				people.markDirty() // to ensure we'll save it if it's the first time?

                
        Whenever a BNStorableNode instance is created, it's init method tells the store of 
        it's existence ( addActiveObject(aNode) ) and marks itself as dirty.
        
        All dirty objects are persisted on the next event loop. Doing this in the event loop
		avoids multiple writes for multiple changes within a given loop.
    
    How it works: 
    
        Persistent ids:
    
        each object is assigned a _pid property when persisted 
        _pid is a unique (persistent id) number (in string form) for the object
    
        If a dictionary value points to string or number, it's value is stored in json.
        Otherwise, it's value is stored as a pid reference in a dictionary 
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
            
            // when you modify any BMNode instance's subnodes or data slots, 
            // or call markDirty() on it, it will be marked as needing to be persisted in the
            // next event loop
            
                var test = BMNode.clone()
                root.this.addSubnode(test) // this marks root as dirty
                test.this.addSubnode(foo) // this marks test as dirty
                        
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

//NodeStore.shared().setFolder(window.app.storageFolder().folderNamed("pdb"))   

NodeStore = ideal.Proto.extend().newSlots({
    type: "NodeStore",
    folderName: "NodeStore",
    folder: null,
    
    dirtyObjects: null,
    hasTimeout: false,
    
    activeObjectsDict: null,
    storingObjects: null,
    debug: false,

	sdb: null,
	
	isReadOnly: false,
}).setSlots({
    init: function () {
        this.setDirtyObjects({})
        this.setActiveObjectsDict({})
		this.setSdb(SyncDB.clone())
		//this.asyncOpen()
    },
	
	descriptionForByteCount: function(b) {
		if (b < 1024) {
			return b + " bytes"
		}
		
		if (b < 1024*1024) {
			return Math.floor(b/1024) + " KB"
		}
		
		return Math.floor(b/(1024*1024)) + " MB"
	},

	shortStatsString: function() {
		if (!this.isOpen()) {
			return "closed"
		}
		return this.sdb().size() + " objects, " + this.descriptionForByteCount(this.sdb().totalBytes())
	},
	
	isOpen: function() {
		return this.sdb().isOpen()	
	},

	asyncOpen: function(callback) {
		this.sdb().asyncOpen(() => {
			this.didOpen()
			//this.clear()
			if (callback) {
				callback()
			}
		})		
	},
	
	didOpen: function() {
		//if (this.debug()) {
			//this.show()
			//this.sdb().idb().show()
			//this.show()
			this.collect()
			//this.show()
		//}
	},
    
    shared: function() {
        if (!this._shared) {
            this._shared = this.clone()
            //this._shared.setFolder(window.app.storageFolder().folderNamed(this.folderName())) 
        }
        return this._shared
    },

	rootInstanceWithPidForProto: function(pid, proto) {		
		if (this.hasObjectForPid(pid)) {
			return this.objectForPid(pid)
		} 
		
		return  proto.clone().setPid(pid)
	},
	
    // dirty objects
    
    addDirtyObject: function(obj) {
        // dirty objects list won't be huge, so a list is ok
        
        
		var pid = obj.pid()
        if (!(pid in this._dirtyObjects)) {
	       // this.debugLog("addDirtyObject(" + obj.pid() + ")")
            this._dirtyObjects[pid] = obj
            this.setTimeoutIfNeeded()
        }
        
        return this
    },
    
    setTimeoutIfNeeded: function() {
        if (!this._hasTimeout) {
            this._hasTimeout = true
            setTimeout( () => { 
                this._hasTimeout = false
                this.storeDirtyObjects() 
            }, 10)
        }
        
        return this
    },
        
    // writing
    
    debugLog: function(s) {
        if (this.debug()) {
            console.log(this.type() + ": " + s)
        }
    },
    
    storeDirtyObjects: function() {
        console.log(" --- " + this.type() + " storeDirtyObjects --- ")
        
		this.assertIsWritable()
	
		if (!this.sdb().isOpen()) { // delay until it's open
			throw new Error(this.type() + " storeDirtyObjects but db not open")
		}
		
		this.sdb().begin() 
		
        // it's ok to add dirty objects via setPid() while this is
        // working as it will pick it up and won't cause a loop
        
        //console.log("NodeStore.storeDirtyObjects")

        var totalStoreCount = 0

		while (true) {
	        var storeCount = 0
			var dirtyBucket = this._dirtyObjects
        	this._dirtyObjects = {}

	        for (pid in dirtyBucket) {
                if (dirtyBucket.hasOwnProperty(pid)) {
		            var obj = dirtyBucket[pid]
		            this.storeObject(obj)
		            storeCount ++
				}
	        }
	
			totalStoreCount += storeCount
			
			if (storeCount == 0) {
				break
			}
		} 
        
        this.debugLog("NodeStore.storeDirtyObjects stored " +  totalStoreCount + " objects")
		if (this.debug()) {
			this.show()
		}

		this.sdb().commit() // flushes write cache

		/*
		setTimeout( () => {
			this.sdb().verifySync()
		})
		*/

        return totalStoreCount
    },
    
    newPid: function() {
		return Math.floor(Math.random() * Math.pow(10, 17)).toString()
    },

    pidOfObj: function(obj) {
        if (!("_pid" in obj) || obj._pid == null) {
            obj._pid = obj.type() + "_" + this.newPid()
        }   
        return obj._pid     
    },
    
	assertIsWritable: function() {
		if (this.isReadOnly()) {
			throw new Error("attempt to write to read-only store")
		}	
	},

    storeObject: function(obj) {
        this.debugLog("storeObject(" + obj.pid() + ") = " + JSON.stringify(obj.nodeDict()))
		this.assertIsWritable()
	
        this.sdb().atPut(obj.pid(), JSON.stringify(obj.nodeDict()))
        
        /*
        this happens automatically: 
        - when subnode pids are requested for serialization, 
        they are added to dirty when pid is assigned
        */
        
        return this
    },
    
    
    // reading
    
    loadObject: function(obj) {
		try {
	        var nodeDict = this.nodeDictAtPid(obj.pid())
	        if (nodeDict) {
	            obj.setNodeDict(nodeDict)
	            return true
	        }
		} catch(error) {
			this.setIsReadOnly(true)
			console.log(error.stack, "background: #000; color: #f00")
			throw new Error(error)
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
  
    nodeDictAtPid: function(pid) {
        var v = this.sdb().at(pid)
        if (v == null) { 
            return null 
        }        
        return JSON.parse(v)
    },

	hasObjectForPid: function(pid) {
		return this.sdb().hasKey(pid)
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
			var error = "missing pid '" + pid + "'"
			console.warn("WARNING: " + error)
			return null
            throw new Error(error)
        }
        
        var proto = window[nodeDict.type]
        if (!proto) {
            throw new Error("missing proto '" + nodeDict.type + "'")
        }
        var obj = proto.clone()
        // need to set pid before dict to handle circular refs
        obj.setPid(pid) 
		//console.log(" nodeDict = ", nodeDict)
        obj.setNodeDict(nodeDict)

        //this.debugLog("objectForPid(" + pid + ")")

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
        this.activeObjectsDict().slotValues().forEach((obj) => {
            this.storeObject(obj)
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

	rootPids: function() {
		// pids beginning with _ are considered root
		// to delete them you'll need to call removeEntryForPid()
		
		return this.sdb().keys().select(function (pid) {
			return pid[0] == "_"
		})
	},
    
    collect: function() {
        // this is an on-disk collection
        // in-memory objects aren't considered
        
        this.debugLog("--- begin collect ---")
        this._marked = {}
        //this.markPid("_root")
		this.rootPids().forEach( (rootPid) => {
	        this.markPid(rootPid)
		})
        var deleteCount = this.sweep()
        this._marked = null
        //if (deleteCount) {
            this.debugLog("--- end collect - collected " + deleteCount + " pids ---")
        //}
		this.sdb().verifySync()
        return deleteCount
    },
    
    markPid: function(pid) {
        this.debugLog("markPid(" + pid + ")")
        
        if (this._marked[pid] == true) { 
            // already marked it
            return 
        }
        this._marked[pid] = true
                
        var childPids = this.pidRefsFromPid(pid)
       	this.debugLog(pid + " refs " + JSON.stringify(childPids))
        
        childPids.forEach((childPid) => {
            this.markPid(childPid)
        })
    },
    
    sweep: function(deleteCount) {
        console.log(" --- " + this.type() + " sweep --- ")
        // delete all unmarked records
        this.sdb().begin()
        
        var deleteCount = 0
        var pids = this.sdb().keys()

         pids.forEach((pid) =>{
            if (this._marked[pid] != true) {
                this.debugLog("deletePid(" + pid + ")")
                this.sdb().removeAt(pid)
                deleteCount ++
            } 
         })
         
        this.sdb().commit()
            
         return deleteCount
    },
    
    // transactions
    
    begin: function() {
        throw new Error("transactions not implemented yet")
        
    },
    
    commit: function() {
        throw new Error("transactions not implemented yet")
    },
    
    asJson: function() {
		this.sdb().asJson()
    },
    
    clear: function() {
        console.log("NodeStore clearing all data!")
		//throw new Error("NodeStore clearing all data!")
        this.sdb().clear();
    },

	show: function() {
		console.log("--- NodeStore show ---")
		this.rootPids().forEach( (pid) => {
			this.showPid(pid, 1, 3)
		})
		console.log("----------------------")
		//this.sdb().idb().show()
		return this
	},
	
	showPid: function(pid, level, maxLevel) {
		if (level > maxLevel) {
			return
		}
		
		var stringReplacer = function(value) {
			if (typeof(value) === 'string' && value.length > 100) {
				return value.substring(0, 100) + "...";
			}	
			return value		
		}
		
		var replacer = function(key, value) {
		  value = stringReplacer(value)
		
		  if (typeof(value) === 'array') {
			 return value.map(stringReplacer)
		  }
		  return value;
		}
		
		var indent = "   ".repeat(level) 
        var nodeDict = this.nodeDictAtPid(pid)
		console.log(indent + pid + ": " + JSON.stringify(nodeDict, replacer, 2 + indent.length))
		
		if (nodeDict.children) {
			nodeDict.children.forEach( (childPid) => {
				this.showPid(childPid, level + 1, maxLevel)
			})
		}

	},
})
