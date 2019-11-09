"use strict"

/*

    BMStorableNode 
    
*/

BMNode.newSubclassNamed("BMStorableNode").newSlots({
    pid: null,
    shouldStore: false,

    storedSlots: null, // dict
    
    shouldStoreSubnodes: true,
    //loadsUnionOfChildren: false,
    isUnserializing: false,
    
    doesLazyLoadChildren: false,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setStoredSlots({})
        this.scheduleSyncToStore()
        //this.addStoredSlot("viewDict")
        this.addStoredSlot("canDelete")  // TODO: move elsewhere
    },
    
    defaultStore: function() {
        if (this._nodeStore) {
            return this._nodeStore
        }
        return NodeStore.shared()
    },

    // --- overrides from parent class ---
    // hook this to schedules writes when subnode list is changed

    didChangeSubnodeList: function() {
        BMNode.didChangeSubnodeList.apply(this)
        if (this.shouldStoreSubnodes()) {
            this.scheduleSyncToStore()
        }
        return this
    },

    // -----------------------------------------------
    // persistence id - "pid"
    // -----------------------------------------------

    instanceWithPidFromStore: function (pid, aStore = this.defaultStore()) { // proto method
        //assert(pid[0] === "_")
        // replace rootInstanceWithPidForProto with this method?

        if (aStore.hasObjectForPid(pid)) {
            return aStore.objectForPid(pid)
        }

        const obj = this.clone().justSetPid(pid)
        aStore.addActiveObject(this)
        return obj
    },
    
    setPid: function(aPid, aStore = this.defaultStore()) {
        //throw new Error("testing if this is called directly while moving addActiveObject call to store side");
        
        this.justSetPid(Pid)
        //aStore.addActiveObject(this) // TODO: can't rely on this with multiple stores
        this.scheduleSyncToStore()
        
        return this
    },
    
    
    justSetPid: function(aPid) { // don't schedule sync
        //this._pid = aPid
        this.setPuuid(aPid)
        this.defaultStore().addActiveObject(this)
        return this
    },
    
    hasPid: function() {
        return !Type.isNullOrUndefined(this._pid)
    },
    
    /*
    assignPid: function() {
        if (this._pid) {
            throw new Error("attempt to reassign pid")
        }
        this.justSetPid(this.puuid()) 
        this.didAssignPid()
        return this
    },
    */

    didAssignPid: function() {
        this.defaultStore().addActiveObject(this)
        this.scheduleSyncToStore() // add to dirty objects
        return this
    },

    // --------------------------
    
    pid: function() {
        if (!this.shouldStore()) {
            throw new Error("attempt to prepare to store a node of type '" + this.type() + "' which has shouldStore === false, use this.setShouldStore(true)")
        }
		
        if (!this.hasPuuid()) {
            this.puuid()
            this.didAssignPid()
        }
        return this.puuid()
    },

    // -------------------------------------------

    // --- add / remove stored slots ---
    
    initStoredSubnodeSlotWithProto: function(name, proto) {
        const obj = proto.clone()
        this.newSlot(name, obj)
        this.justAddSubnode(obj)
        this.addStoredSlot(name)
        return this
    },
    
    addStoredSlots: function(slotNames) {
        slotNames.forEach((slotName) => {
            this.addStoredSlot(slotName)
        })
        return this
    },
    
    addStoredSlot: function(slotName) {
        this.storedSlots()[slotName] = true
        // Note: BMStorableNode hooks didUpdateSlot() to call scheduleSyncToStore on updates. 
        return this
    },
    
    removeStoredSlot: function(slotName) {
        delete this.storedSlots()[slotName]
        return this
    },

    // --- get storage dictionary ---


    nodeDict: function (aStore = this.defaultStore()) { 
        const dict = this.nodeDictForProperties()
        
        if (this.subnodes().length && this.shouldStoreSubnodes()) {
            dict.children = this.subnodePids(aStore)
        }
        
        return dict
    },


    nodeDictForProperties: function (aStore = this.defaultStore()) {
        const dict = {}
        dict.type = this.type()
 
        //console.log(this.typeId() + " storedSlots = " + JSON.stringify(this.storedSlots()))
       
        Object.keys(this.storedSlots()).forEach((k) => {
            let v = null
            if (k.beginsWith("_")) {
                v = this[k]
            } else {
                const isFunction = Type.isFunction(this[k])
                if(!isFunction) {
                    console.warn("WARNING: " + this.type() + "." + k + "() not a method")
                }

                try {
	                v = this[k].apply(this)
                } catch(error) {
                    console.warn("WARNING: " + this.type() + "." + k + "() exception calling method")
                    //throw error
                }
            }
           
            dict[k] = aStore.refValueIfNeeded(v)
        })
        
        return dict
    },

 
    // --- set storage dictionary ---
   
    setNodeDict: function (aDict, aStore = this.defaultStore()) { 
	    //BMNode.setNodeDict.apply(this, [aDict])
        // TODO: wrap in try {}
        this.setIsUnserializing(true) 
        this.setNodeDictForProperties(aDict, aStore)
        if (!this.doesLazyLoadChildren()) {
            this.setNodeDictForChildren(aDict, aStore)
        }
        this.didLoadFromStore()
        this.setIsUnserializing(false) 
        return this
    },
    
    prepareToAccess: function(aStore = this.defaultStore()) {
        BMNode.prepareToAccess.apply(this)
        if (this.doesLazyLoadChildren()) {
            const dict = aStore.nodeDictAtPid(this.pid())
            this.setNodeDictForProperties(dict)
        }
        return this
    },
    
    setNodeDictForProperties: function (aDict, aStore = this.defaultStore()) {
        let hadMissingSetter = false 
        Object.keys(aDict).forEach((k) => {
            if (k !== "children" && k !== "type") {
                let v = aDict[k]
                v = aStore.unrefValueIfNeeded(v)
                
                if (k.beginsWith("_")) {
                    this[k] = v
                } else {
                    const setter = this.setterNameForSlot(k)
                    if (this[setter]) {
                        this[setter].apply(this, [v])
                    } else {
                        console.error("WARNING: " + this.type() + "." + setter + "(", v , ") not found - dict is: " , aDict) //, JSON.stringify(aDict))
                        hadMissingSetter = true
                    }
                }
            }
        })
   
        if (hadMissingSetter && !aStore.isReadyOnly()) {
            this.scheduleSyncToStore()
        }
		
        return this
    },

    setNodeDictForChildren: function (aDict, aStore = this.defaultStore()) {
        let newPids = aDict.children
        if (newPids) {
            /*
            if (this.loadsUnionOfChildren()) {
                throw new Error("loadsUnionOfChildren") // checking if this is being used
                newPids = this.subnodePids().union(newPids)
            }
            */
            
            this.setSubnodePids(newPids, aStore)
        }
        return this
    },
    
    // --- udpates ---
	
    scheduleLoadFinalize: function() {
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "loadFinalize")
    },
    
    
    loadFinalize: function() {
        // called after all objects loaded within this event cycle
    },
	
    didLoadFromStore: function() {
        //console.log(this.typeId() + " didLoadFromStore in BMStorableNode")
        // chance to finish any unserializing this particular instance
        // also see: loadFinalize
		
        this.checkForStoredSlotsWithoutPids()
    },

    checkForStoredSlotsWithoutPids: function() {
        // make sure all stored slots have pids after load
        // if not, we've just added them and they'll need to be saved
        // as well as this object itself

        Object.keys(this._storedSlots).forEach((slotName) => {
            const obj = this[slotName].apply(this)
            const isRef = obj !== null && obj !== undefined && obj.typeId !== undefined
            if (isRef && !obj.hasPid()) {
                obj.pid()
                this.defaultStore().addDirtyObject(this)
                //console.log(">>>>>>>>>>>>>>>>> loadFinalize assigned pid ", obj.pid())
            }
        })		
    },

    scheduleSyncToStore: function() {
        //console.log(this.typeId() + " scheduleSyncToStore this.hasPid() = ", this.hasPid())
        //const typeId = this.typeId()
        const hasPid = this.hasPid()
        const shouldStore = this.shouldStore()
        const isUnserializing = this.isUnserializing()

        if (hasPid && shouldStore && !isUnserializing) {
        	this.defaultStore().addDirtyObject(this)
            //this._refPids = null
        }

        return this
    },
	
    didUpdateSlot: function(slotName, oldValue, newValue) {
	    if (!this._storedSlots || !this.shouldStore()) {
	        // looks like StorableNode hasn't initialized yet
	        return this
	    }
	    
        // check so we don't mark dirty while loading
        // and use private slots directly for performance
        if (slotName in this._storedSlots) { 
            //console.log(this.typeId() + ".didUpdateSlot(" + slotName + ",...) -> scheduleSyncToStore")
            this.scheduleSyncToStore()
        }
		
        if (newValue != null && this.subnodes().includes(oldValue)) { // TODO: add a switch for this feature
            newValue.setParentNode(this)
            this.subnodes().replaceOccurancesOfWith(oldValue, newValue)
            //console.log(this.typeId() + " this.subnodes().replaceOccurancesOfWith(", oldValue, ",", newValue, ")")
        }
    },
	
    // subnodes
	
    subnodePids: function() {
        const storableSubnodes = this.subnodes().filter(sn => sn.shouldStore())
        const pids = storableSubnodes.map(sn => sn.pid())
        return pids
    },
    
    setSubnodePids: function(pids, aStore = this.defaultStore()) {
        const subnodes = pids.map((pid) => {
            return aStore.objectForPid(pid)
        })

        this.setSubnodes(subnodes)
        return this
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

    nodePidRefsFromNodeDict: function(nodeDict) {
        const pids = []

        if (nodeDict) {
            // property pids
            Object.keys(nodeDict).forEach((k) => {
                const v = nodeDict[k]
                const childPid = this.defaultStore().pidIfRef(v)
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
    
    /*
	nodeRefPids: function() {
		if (this._refPids === null) {
			const refs = {}
			const dict = this.nodeDict()
			const keys = Object.keys(dict)
		
			const name = this.typeId()
			//debugger;
			// stored slots
			keys.forEach((k) => {
				const v = dict[k]
				if (k !== "children" && Type.isObject(v)) {
					if (v.pid != "null") {
						refs[v.pid] = true
					}
				}
			})
		

			// children
			if (dict.children) {
				dict.children.forEach((pid) => {
					if (pid === null || pid === "null") {
						debugger;
					}
					refs[pid] = true
				})
			}
		
			//this._refPids = refs
			
		//	console.log(this.pid() + " nodeRefPids: ", Object.keys(refs))
		}
		//return this._refPids
		
		return refs
	},
	*/


    // duplicateable / copy protocol?



    /*
    nodeDuplicateDict: function () {
        const dict = this.nodeDictForProperties()
        
        if (this.subnodes().length && this.shouldStoreSubnodes()) {
            dict.children = this.subnodePids()
        }
        
        return dict
    },

    // --- set storage dictionary ---
   
    setNodeDuplicateDict: function (aDict) { 
	    //BMNode.setNodeDict.apply(this, [aDict])
        // TODO: wrap in try {}
        this.setIsUnserializing(true) 
        this.setNodeDictForProperties(aDict)
        if (!this.doesLazyLoadChildren()) {
            this.setNodeDictForChildren(aDict)
        }
        this.didLoadFromStore()
        this.setIsUnserializing(false) 
        return this
    },
    */
})
