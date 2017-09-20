/*
    NodeStore: 

		An object store for BMStorableNode objects, that supports 
		- read reference cache of "activeObjects" so re-loading an object will reference the same instance
		- a write reference cache of "dirtyObjects"
		- automatic tracking of dirty objects (objects whose state needs to be persisted)
		- group transactional writes of dirty objects ( nodeStore.storeDirtyObjects() )
		- on disk garbage collection of persisted objects ( nodeStore.collect() )	
		- supports circular references and properly collecting them
	
    
    Garbage collection:
    
		The collector can have multiple roots. Any object stored with a pid (persistent Id) that begins
		with an underscore will be treated as a root object and always marked when collecting garbage.
		
        Example:
 
				var people = NodeStore.rootInstanceWithPidForProto("_people", PeopleNode) 
		
		This instantiates the object if it's not persisted, loads it if it is, and returns any already 
		unpersisted instance if there is one.

	Active objects:
                
        Whenever a BNStorableNode instance is created, it's init method tells the store of 
        it's existence ( addActiveObject(aNode) ) and marks itself as dirty if it's not being unserialized.
        
        All dirty objects are transactionally persisted on the next event loop. 
		This avoids multiple writes for multiple changes within a given loop.
    
    Persistent ids:
    
        each object is assigned a _pid property when persisted 
        _pid is a unique (persistent id) number (in string form) for the object
    
        If a serialized object record dictionary value points to string or number, it's value is stored in json.
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
    
                var store = NodeStore.clone().setFolderName("store")
            
            // need to define a root
            
                var root = BMStorableNode.clone()
                store.setRootObject(root)
                store.load()
            
            // when you modify any BMStorableNode instance's subnodes or stored data slots, 
            // or call scheduleSyncToStore() on it, it will be marked as needing to be persisted in the
            // next event loop
            
                var test = BMNode.clone()
                root.this.addSubnode(test) // this marks root as dirty
                test.this.addSubnode(foo) // this marks test as dirty
                        
            // for singleton objects, set their pid to a unique name, e.g.
            
                servers.setPid("_servers")
            
            // when ready to store
            
                store.store()
            
            
    
    Garbage collection
    
        Periodically (e.g. when opening/closing an app) you'll want to delete any unreferenced
        object records to make sure they don't use up too much space. To do this call:
    
            pdb.collect()
 
*/


NodeStore = ideal.Proto.extend().newSlots({
    type: "NodeStore",
    folderName: "NodeStore",
    folder: null,
    
    dirtyObjects: null,
    hasTimeout: false,
    
    activeObjectsDict: null,
    justLoadedObjectsDict: null,

	sdb: null,
	
	isReadOnly: false,

    debug: false,
}).setSlots({
    init: function () {
        this.setDirtyObjects({})
        this.setActiveObjectsDict({})
        this.setJustLoadedObjectsDict({})
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
		if (this.isOpen()) {
			throw new Error(this.typeId() + ".asyncOpen() already open")
		}
		this.sdb().asyncOpen(() => {
			this.didOpen()
			//this.clear()
			if (callback) {
				callback()
			}
		})		
	},
	
	didOpen: function() {
		
		this.collect()
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
	
	// ----------------------------------------------------
    // dirty objects
	// ----------------------------------------------------
    
    addDirtyObject: function(obj) {
        // dirty objects list won't be huge, so a list is ok
        
        
		var pid = obj.pid()
        if (!(pid in this._dirtyObjects)) {
			//console.log("addDirtyObject(" + obj.pid() + ")")
	       // this.debugLog("addDirtyObject(" + obj.pid() + ")")
            this._dirtyObjects[pid] = obj
            this.setStoreTimeoutIfNeeded()
        }
        
        return this
    },
    
    setStoreTimeoutIfNeeded: function() {
        if (!this._hasStoreTimeout && this.hasDirtyObjects()) {
            this._hasStoreTimeout = true
            setTimeout( () => { 
                this.storeDirtyObjects() 
                this._hasStoreTimeout = false
            }, 10)
        }
        
        return this
    },
        
	// ----------------------------------------------------
    // writing
	// ----------------------------------------------------
    
    debugLog: function(s) {
        if (this.debug()) {
            console.log(this.type() + ": " + s)
        }
    },
    
	hasDirtyObjects: function() {
		return Object.keys(this._dirtyObjects).length > 0
	},

    storeDirtyObjects: function() {
		this.debugLog(" --- begin storeDirtyObjects --- ")
		
		//console.log(" --- begin storeDirtyObjects --- ")
		if (!this.hasDirtyObjects()) {
			console.log("no dirty objects to store Object.keys(this._dirtyObjects) = ", Object.keys(this._dirtyObjects))
			return this
		}

		//this.showDirtyObjects()
		//this.showActiveObjects()
		
		
		this.assertIsWritable()
	
		if (!this.sdb().isOpen()) { // delay until it's open
			throw new Error(this.type() + " storeDirtyObjects but db not open")
		}
		
		this.sdb().begin() 
		
        // it's ok to add dirty objects via setPid() while this is
        // working as it will pick it up and won't cause a loop
        
        var totalStoreCount = 0

		while (true) {
	        var storeCount = 0
			var dirtyBucket = this._dirtyObjects
        	this._dirtyObjects = {}

	        for (pid in dirtyBucket) {
                if (dirtyBucket.hasOwnProperty(pid)) {
		            var obj = dirtyBucket[pid]
		
					//if (pid[0] == "_" || this.objectIsReferencedByActiveObjects(obj)) {
		            	this.storeObject(obj)
					//}
					
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
		if (this.debug()) {
			this.collect()
		}
		*/
		//console.log(" --- end storeDirtyObjects --- ")
		
        return totalStoreCount
    },


	assertIsWritable: function() {
		if (this.isReadOnly()) {
			throw new Error("attempt to write to read-only store")
		}	
	},

    storeObject: function(obj) {
		this.assertIsWritable()
		
		var aDict = obj.nodeDict()

		if (obj.willStore) {
			obj.willStore(aDict)
		}
		
        //this.debugLog("storeObject(" + obj.pid() + ") = " + s)
	
		var serializedString = JSON.stringify(aDict)
        this.sdb().atPut(obj.pid(), serializedString)
        
        /*
        this happens automatically: 
        - when subnode pids are requested for serialization, 
        they are added to dirty when pid is assigned
        */

/*
        if (obj.pid().contains("Chat")) {
            console.log(">>>> " + obj.pid() + " didStore " + serializedString)
        }
  */
        
		if (obj.didStore) {
			obj.didStore(aDict)
		}
        
        return this
    },
    
	// ----------------------------------------------------
	// pids
	// ----------------------------------------------------
    
    newPid: function() {
		return Math.floor(Math.random() * Math.pow(10, 17)).toString()
    },

    pidOfObj: function(obj) {
        if (!("_pid" in obj) || obj._pid == null) {
            obj._pid = obj.type() + "_" + this.newPid()
        }   
        return obj._pid     
    },


	// ----------------------------------------------------
    // just loaded objects
	// ----------------------------------------------------
    
	isNewLoadCycle: function() {
		return this.justLoadedObjectsDict().slotValues().length == 0
	},
	
	addJustLoadedObject: function(obj) {
		this.justLoadedObjectsDict()[obj.pid()] = obj
		return this
	},
	
	finalizeJustLoadedObjects: function() {
		var loadedObjs = this.justLoadedObjectsDict().slotValues()
		console.log(this.type() + " finalizeJustLoadedObjects ", loadedObjs.length)
        loadedObjs.forEach((obj) => {
            obj.didFinalizeLoadFromStore()
        })
		this.clearJustLoadedObjects()
		return this
	},
	
	clearJustLoadedObjects: function() {
		this.setJustLoadedObjectsDict({})
		return this
	},
	
    setFinalizeLoadTimeoutIfNeeded: function() {
        if (!this._hasFinalizeLoadTimeout) {
            this._hasFinalizeLoadTimeout = true
            setTimeout( () => { 
                this.finalizeJustLoadedObjects() 
                this._hasFinalizeLoadTimeout = false
            }, 10)
        }
        
        return this
    },
	
	// ----------------------------------------------------
    // reading
	// ----------------------------------------------------
	
	
    loadObject: function(obj) {
			
		this.setFinalizeLoadTimeoutIfNeeded()
		
		try {
	        var nodeDict = this.nodeDictAtPid(obj.pid())
	        if (nodeDict) {
	            obj.setNodeDict(nodeDict)
				this.addJustLoadedObject(obj)
	            return true
	        }
		} catch(error) {
			this.setIsReadOnly(true)
			console.log(error.stack, "background: #000; color: #f00")
			throw error
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

		this.setFinalizeLoadTimeoutIfNeeded()
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
        obj.setPid(pid) // calls addActiveObject()
		//this.debugLog(" nodeDict = ", nodeDict)
        obj.setNodeDict(nodeDict)
		this.addJustLoadedObject(obj)

        //this.debugLog("objectForPid(" + pid + ")")

        return obj
    },
    
	// ----------------------------------------------------
	// active objects (the read cache)
	// ----------------------------------------------------

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
        var nodeDict = this.nodeDictAtPid(pid)
        if (!nodeDict) {
            return []
        }
        
        var proto = window[nodeDict.type]
        if (!proto) {
            proto = BMStorageNode
        }
        
        return proto.nodePidRefsFromNodeDict(nodeDict)    
    },
    
    /*
    pidRefsFromNodeDict: function(nodeDict) {
        var pids = []

        if (nodeDict) {
            // property pids
            for (var k in nodeDict) {
                if (nodeDict.hasOwnProperty(k)) {
                    var v = nodeDict[k]
                    var childPid = this.pidIfRef(v)
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
    */
    
	// ----------------------------------------------------
    // garbage collection
	// ----------------------------------------------------

	rootPids: function() {
		// pids beginning with _ are considered root
		// to delete them you'll need to call removeEntryForPid()
		
		return this.sdb().keys().select(function (pid) {
			return pid[0] == "_"
		})
	},
    
    flushIfNeeded: function() {
		if (this.hasDirtyObjects()) {
            this.storeDirtyObjects()
            assert(!this.hasDirtyObjects())
        }
        return this   
    },
    
    collect: function() {
        // this is an on-disk collection
        // in-memory objects aren't considered
        // so we make sure they're flush to the db first 

		this.flushIfNeeded()

        this.debugLog("--- begin collect ---")
        
        this._marked = {}

		this.rootPids().forEach( (rootPid) => {
	        this.markPid(rootPid) // this is recursive, but skips marked records
		})
		
        //this.markActiveObjects() // not needed if assert(!this.hasDirtyObjects()) is above
		
        var deleteCount = this.sweep()
        this._marked = null
        
        this.debugLog("--- end collect - collected " + deleteCount + " pids ---")
        
        return deleteCount
    },
    
    markActiveObjects: function() {
		Object.keys(this.activeObjectsDict()).forEach((pid) => {
	        this._marked[pid] = true
		})        
        return this
    },
    
    markPid: function(pid) {
        this.debugLog("markPid(" + pid + ")")
        
        if (this._marked[pid] == true) { 
            return false // already marked it
        }
        this._marked[pid] = true
                
        var refPids = this.pidRefsFromPid(pid)
       	this.debugLog(pid + " refs " + JSON.stringify(refPids))
/*
        if (pid.contains("Chat")) {
            var nodeDict = this.nodeDictAtPid(pid)

            console.log("markPid(" + pid + ")")
            console.log("    nodeDict: ", JSON.stringify(nodeDict))
            console.log("     refPids: ", JSON.stringify(refPids))
        }
*/  
        refPids.forEach((refPid) => {
            this.markPid(refPid)
        })
        
        return true
    },
    
    sweep: function(deleteCount) {
        this.debugLog(" --- sweep --- ")
        // delete all unmarked records
        this.sdb().begin()
        
        var deleteCount = 0
        var pids = this.sdb().keys()

         pids.forEach((pid) =>{
            if (this._marked[pid] != true) {
                this.debugLog("deletePid(" + pid + ")")
                /*
                if (pid.contains("Chat")) {
                    console.log("deletePid(" + pid + ")")
                }
                */
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
		return this.sdb().asJson()
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
		return this
	},
	
	showDirtyObjects: function() {
		var dirty = this._dirtyObjects
		//console.log("dirty objects: ")
		console.log("dirty objects:  " + Object.keys(dirty).join(", "))
		/*
		Object.keys(dirty).forEach((pid) => {
			var obj = dirty[pid]
			console.log("    " + pid + ": ", Object.keys(obj.nodeRefPids()))
		})
		*/
		return this
	},

	showActiveObjects: function() {
		var active = this.activeObjectsDict()
		console.log("active objects: ")
		
		Object.keys(active).forEach((pid) => {
			var obj = active[pid]
			console.log("    " + pid + ": ", Object.keys(obj.nodeRefPids()))
		})
		
		var pid = "_localIdentities"
		var obj = active[pid]
		//debugger;
		console.log("    " + pid + ": ", Object.keys(obj.nodeRefPids()))
		
		return this		
	},
	
	objectIsReferencedByActiveObjects: function(aNode) {
		var nodePid = aNode.pid()
		var active = this.activeObjectsDict()
				
		var result = Object.keys(active).detect((pid) => {
			var obj = active[pid]
			var match = (!(obj === aNode)) && obj.nodeReferencesPid(nodePid)
			return match
		}) != null

		if (!result) {
			//console.log(">>>>>> " + aNode.pid() + " is unreferenced - not storing!")
		}
		return result
	},
})
