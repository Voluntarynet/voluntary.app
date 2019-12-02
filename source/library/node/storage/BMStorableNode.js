"use strict"

/*

    BMStorableNode 
    
*/

window.BMStorableNode = class BMStorableNode extends BMNode {
    
    initPrototype () {
        this.newSlots({
            shouldStore: false,
            shouldStoreSubnodes: true,
            //loadsUnionOfChildren: false,
            isUnserializing: false,
            doesLazyLoadChildren: true,
            subnodePids: null,
        })
        this.protoAddStoredSlot("canDelete")  // TODO: move elsewhere
    }

    init () {
        super.init()
        this.scheduleSyncToStore()
    }

    // --- overrides from parent class ---
    // hook this to schedules writes when subnode list is changed

    didChangeSubnodeList () {
        super.didChangeSubnodeList()

        if (this.shouldStoreSubnodes()) {
            this.scheduleSyncToStore()
        }
        return this
    }

    // -----------------------------------------------
    // persistence id - "pid"
    // -----------------------------------------------

    instanceWithPidFromStore (pid, aStore = this.defaultStore()) { // proto method
        //assert(pid[0] === "_")
        // replace rootInstanceWithPidForProto with this method?

        if (aStore.hasObjectForPid(pid)) {
            return aStore.objectForPid(pid)
        }

        const obj = this.clone().setPid(pid)
        aStore.addActiveObject(this)
        return obj
    }
    
    setPid (aPid, aStore = this.defaultStore()) {
        this.setPuuid(aPid)
        return this
    }    

    // --- stored slots ---
    
    initStoredSubnodeSlotWithProto (name, proto) {
        const obj = proto.clone()
        this.newSlot(name, obj)
        this.justAddSubnode(obj)
        this.addStoredSlot(name)
        return this
    }

    // writing object to store

    nodeDict (aStore = this.defaultStore()) { 
        const dict = this.nodeDictForProperties()
        
        if (this.subnodeCount() && this.shouldStoreSubnodes()) {
            dict.children = this.subnodePids(aStore)
        }
        
        return dict
    }

    getStoreSlotValue (k) {
        let v = undefined

        if (k.beginsWith("_")) {
            v = this[k]
        } else {
            if(!Type.isFunction(this[k])) {
                console.warn("WARNING: " + this.type() + "." + k + "() not a method")
            }

            try {
                v = this[k].apply(this)
            } catch(error) {
                console.warn("WARNING: " + this.type() + "." + k + "() exception calling method")
            }
        }

        return v
    }

    nodeDictForProperties (aStore = this.defaultStore()) {
        const dict = {}
        dict.type = this.type()
 
        //this.debugLog(" storedSlotNames = " + JSON.stringify(this.storedSlotNames()))
       
        Object.keys(this.storedSlotNames()).forEach((k) => {
            const v = this.getStoreSlotValue(k)
            dict[k] = aStore.refValueIfNeeded(v)
        })
        
        return dict
    }

 
    // reading object from store
   
    setNodeDict (aDict, aStore = this.defaultStore()) { 
	    //super.setNodeDict(aDict, aStore)
        // TODO: wrap in try {}
        this.setIsUnserializing(true) 
        this.setNodeDictForProperties(aDict, aStore)
        this.setNodeDictForChildren(aDict, aStore)
        this.didLoadFromStore()
        this.setIsUnserializing(false) 
        return this
    }


    setStoreSlotValue (k, value, aStore = this.defaultStore()) {
        if (k !== "children" && k !== "type") { // not needed with new format
            const v = aStore.unrefValueIfNeeded(value)
            
            if (k.beginsWith("_")) {
                this[k] = v
            } else {
                const setter = this.setterNameForSlot(k)
                if (this[setter]) {
                    this[setter].apply(this, [v])
                } else {
                    console.error("WARNING: " + this.type() + "." + setter + "(", v , ") not found - dict is: " , aDict) //, JSON.stringify(aDict))
                    return false
                }
            }
        }
        return true
    }
    
    setNodeDictForProperties (aDict, aStore = this.defaultStore()) {
        let hadMissingSetter = false 
        Object.keys(aDict).forEach((k) => {
            if(!this.setStoreSlotValue(k, aDict[k], aStore)) {
                hadMissingSetter = true
            }
        })
   
        if (hadMissingSetter && !aStore.isReadyOnly()) {
            this.scheduleSyncToStore()
        }
		
        return this
    }

    setNodeDictForChildren (aDict, aStore = this.defaultStore()) {
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
    }
    
    // --- udpates ---
	
    scheduleLoadFinalize () {
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "loadFinalize")
    }
    
    
    loadFinalize () {
        // called after all objects loaded within this event cycle
    }
	
    didLoadFromStore () {
        //this.debugLog(" didLoadFromStore in BMStorableNode")
        // chance to finish any unserializing this particular instance
        // also see: loadFinalize
		
        //this.checkForStoredSlotsWithoutPids()
    }

    scheduleSyncToStore () {
        //const typeId = this.typeId()
        const shouldStore = this.shouldStore()
        const isUnserializing = this.isUnserializing()

        if (shouldStore && !isUnserializing && this.isFinalized()) {
            this.defaultStore().addDirtyObject(this)
            //Broadcaster.shared().broadcastNameAndArgument("didChangeStoredSlot", this)
        }

        return this
    }
	
    didUpdateSlot (slotName, oldValue, newValue) {
	    if (!this._storedSlots || !this.shouldStore()) {
	        // looks like StorableNode hasn't initialized yet
	        return this
	    }
	    
        // check so we don't mark dirty while loading
        // and use private slots directly for performance
        if (this._storedSlots.hasOwnProperty(slotName)) {
            //this.debugLog(".didUpdateSlot(" + slotName + ",...) -> scheduleSyncToStore")
            this.scheduleSyncToStore()
        }
		
        if (newValue !== null && this._subnodes.includes(oldValue)) { // TODO: add a switch for this feature
            newValue.setParentNode(this)
            this.subnodes().replaceOccurancesOfWith(oldValue, newValue)
            //this.debugLog(" this.subnodes().replaceOccurancesOfWith(", oldValue, ",", newValue, ")")
        }
    }
	
    // subnodes
    
    subnodeCount () {
        if (this.subnodePids()) {
            return this.subnodePids().length
        }
        return this._subnodes.length
    }
    
    /*
    subnodePids ( aStore = this.defaultStore()) {
        const storableSubnodes = this.subnodes().filter(sn => sn.shouldStore())
        const pids = storableSubnodes.map(sn => { 
            aStore.willRefObject(sn)
            return sn.pid()
        })
        return pids
    }
    */

    setLazySubnodesPids (pids) {
        //values: this.map(v => aStore.refValue(v))

        this._slazySubnodePids = pids
        if (!this.doesLazyLoadChildren()) { // if lazy, we'll load on prepareForFirstAccess
            this.loadSubnodesRecord() 
        }
        return this
    }

    loadSubnodesRecord (aStore = this.defaultStore()) {
        const subnodes = Array.instanceFromRecordInStore(this.subnodesRecord(), aStore)
        this.setSubnodes(subnodes)
        this.setSubnodesRecord(null) // no longer needed
        return this
    }

    prepareForFirstAccess (aStore = this.defaultStore()) {
        super.prepareForFirstAccess()

        if (this.subnodesRecord()) {
            this.loadSubnodesRecord()
        }
        return this
    }

    
    setSubnodePids (pids, aStore = this.defaultStore()) {
        if (this.doesLazyLoadChildren()) {
            this._lazySubnodePids = pids
        } else {
            this.justSetSubnodePids(pids)
        }
        return this
    }
    
    justSetSubnodePids (pids, aStore = this.defaultStore()) {
        const subnodes = pids.map((pid) => {
            return aStore.objectForPid(pid)
        })
        this.setSubnodes(subnodes)
        return this
    }
    
    /*
    pidRefsFromNodeDict (nodeDict) {
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
    }
    */

    
    nodePidRefsFromNodeDict (nodeDict) {
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
    }
    

    // ----------------------------------------
    // new store system
    // ----------------------------------------

}.initThisClass()
