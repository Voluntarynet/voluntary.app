"use strict"

/*

    BMStorableNode
    
*/

BMNode.newSubclassNamed("BMStorableNode").newSlots({
    pid: null,
    shouldStore: false,

    storedSlots: null, // dict
    
    shouldStoreSubnodes: true,
    loadsUnionOfChildren: false,
    isUnserializing: false,
    
    existsInStore: false,
    doesLazyLoadChildren: false,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setStoredSlots({})
        this.scheduleSyncToStore()
        //this.addStoredSlot("viewDict")
        this.addStoredSlot("canDelete")  // TODO: move elsewhere
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

    setPidSymbol: function(aPid) {
        this.setPid(aPid)
        this.loadIfPresent()
        return this
    },
        
    setPid: function(aPid) {
        this._pid = aPid
        NodeStore.shared().addActiveObject(this)
        this.scheduleSyncToStore()
        return this
    },
    
    justSetPid: function(aPid) { // don't schedule sync
        this._pid = aPid
        NodeStore.shared().addActiveObject(this)
        return this
    },
    
    hasPid: function() {
        return this._pid != null
    },
    
    assignPid: function() {
        if (this._pid) {
            throw new Error("attempt to reassign pid")
        }
        // "type" is only using in the pid for debugging purposes
        // no code should depend on it and everything should work the same without it

        //this._pid = NodeStore.shared().pidOfObj(this)
        /*
        const uuid_a = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
        const uuid_b = Math.floor(Math.random() * Math.pow(10, 17)).toBase64()
        this._pid = this.type() + "_" + uuid_a + uuid_b
        */
        this._pid = this.typeId() 

        this.didAssignPid()
        return this
    },

    didAssignPid: function() {
        NodeStore.shared().addActiveObject(this)
        this.scheduleSyncToStore()
        return this
    },

    // --------------------------
    
    pid: function() {
        if (!this.shouldStore()) {
            throw new Error("attempt to prepare to store a node of type '" + this.type() + "' which has shouldStore === false, use this.setShouldStore(true)")
        }
		
        if (!this._pid) {
            this.assignPid()
        }
        return this._pid
    },
  
    /*  
    typeId: function() {
        return this.pid() // is this a good idea?
    },
    */

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

    nodeDictForProperties: function () {
        const dict = {}
        dict.type = this.type()
 
        //console.log(this.typeId() + " storedSlots = " + JSON.stringify(this.storedSlots()))
       
        Object.keys(this.storedSlots()).forEach((k) => {
            let v = null
            if (k.beginsWith("_")) {
                v = this[k]
            } else {
                try {
	                v = this[k].apply(this)
                } catch(error) {
                    console.warn("WARNING: " + this.type() + "." + k + "() exception calling method")
                    //throw error
                }
            }
           
            dict[k] = NodeStore.shared().refValueIfNeeded(v)
        })
        
        return dict
    },

    nodeDict: function () { 
        const dict = this.nodeDictForProperties()
        
        if (this.subnodes().length && this.shouldStoreSubnodes()) {
            dict.children = this.subnodePids()
        }
        
        return dict
    },

    // --- set storage dictionary ---
   
    setNodeDict: function (aDict) { 
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
    
    prepareToAccess: function() {
        BMNode.prepareToAccess.apply(this)
        if (this.doesLazyLoadChildren()) {
            const dict = BMNodeStore.shared().nodeDictAtPid(this.pid())
            this.setNodeDictForProperties(dict)
        }
        return this
    },
    
    setNodeDictForProperties: function (aDict) {
        let hadMissingSetter = false 
        Object.keys(aDict).forEach((k) => {
            if (k !== "children" && k !== "type") {
                let v = aDict[k]
                v = NodeStore.shared().unrefValueIfNeeded(v)
                
                if (k.beginsWith("_")) {
                    this[k] = v
                } else {
                    const setter = "set" + k.capitalized();
                    if (this[setter]) {
                        this[setter].apply(this, [v])
                    } else {
                        console.error("WARNING: " + this.type() + "." + setter + "(", v , ") not found - dict is: " , aDict) //, JSON.stringify(aDict))
                        hadMissingSetter = true
                        //throw error
                    }
                }
            }
        })
   
        if (hadMissingSetter) {
            this.scheduleSyncToStore()
        }
		
        return this
    },

    setNodeDictForChildren: function (aDict) {
        const newPids = aDict.children
        if (newPids) {
            if (this.loadsUnionOfChildren()) {
                throw new Error("loadsUnionOfChildren") // checking if this is being used
                newPids = this.subnodePids().union(newPids)
            }
            
            this.setSubnodePids(newPids)
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
                NodeStore.shared().addDirtyObject(this)
                //console.log(">>>>>>>>>>>>>>>>> loadFinalize assigned pid ", obj.pid())
            }
        })		
    },

    scheduleSyncToStore: function() {
        //console.log(this.typeId() + " scheduleSyncToStore this.hasPid() = ", this.hasPid())
        const typeId = this.typeId()
        const hasPid = this.hasPid()
        const shouldStore = this.shouldStore()
        const isUnserializing = this.isUnserializing()

        //console.log(this.typeId() + " scheduleSyncToStore this.hasPid() = ", this.hasPid())

        if (hasPid && shouldStore && !isUnserializing) {
            //console.log(this.typeId() + " scheduleSyncToStore -> addDirtyObject")
        	NodeStore.shared().addDirtyObject(this)
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
	
    // StorableNode
	
    subnodePids: function() {
        const pids = []
        
        this.subnodes().forEach((subnode) => {
            if (subnode.shouldStore() === true) {
                pids.push(subnode.pid())
            }
        })

        return pids
    },
    
    setSubnodePids: function(pids) {
        const subnodes = pids.map((pid) => {
            return NodeStore.shared().objectForPid(pid)
        })

        this.setSubnodes(subnodes)
        return this
    },

    // store
    
    store: function() {
        NodeStore.shared().storeObject(obj)
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
                const childPid = NodeStore.shared().pidIfRef(v)
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
