"use strict"

/*

    BMStorableNode 
    
*/

BMNode.newSubclassNamed("BMStorableNode").newSlots({
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

        const obj = this.clone().setPid(pid)
        aStore.addActiveObject(this)
        return obj
    },
    
    setPid: function(aPid, aStore = this.defaultStore()) {
        this.setPuuid(aPid)
        return this
    },

    // --------------------------
    

    // --- add / remove stored slots ---
    
    initStoredSubnodeSlotWithProto: function(name, proto) {
        const obj = proto.clone()
        this.newSlot(name, obj)
        this.justAddSubnode(obj)
        this.addStoredSlot(name)
        return this
    },
    
    addStoredSlots: function(slotNames) {
        slotNames.forEach(k => this.addStoredSlot(k))
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

    // writing object to store

    nodeDict: function (aStore = this.defaultStore()) { 
        const dict = this.nodeDictForProperties()
        
        if (this.subnodes().length && this.shouldStoreSubnodes()) {
            dict.children = this.subnodePids(aStore)
        }
        
        return dict
    },

    getStoreSlotValue: function(k) {
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
    },


    nodeDictForProperties: function (aStore = this.defaultStore()) {
        const dict = {}
        dict.type = this.type()
 
        //console.log(this.typeId() + " storedSlots = " + JSON.stringify(this.storedSlots()))
       
        Object.keys(this.storedSlots()).forEach((k) => {
            const v = this.getStoreSlotValue(k)
            dict[k] = aStore.refValueIfNeeded(v)
        })
        
        return dict
    },

 
    // reading object from store
   
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


    setStoreSlotValue: function(k, value, aStore = this.defaultStore()) {
        if (k !== "children" && k !== "type") {
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
    },
    
    setNodeDictForProperties: function (aDict, aStore = this.defaultStore()) {
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
		
        //this.checkForStoredSlotsWithoutPids()
    },

    scheduleSyncToStore: function() {
        //const typeId = this.typeId()
        const shouldStore = this.shouldStore()
        const isUnserializing = this.isUnserializing()

        if (shouldStore && !isUnserializing && this.isFinalized()) {
            this.defaultStore().addDirtyObject(this)
            //Broadcaster.shared().broadcastNameAndArgument("didChangeStoredSlot", this)
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
	
    subnodePids: function( aStore = this.defaultStore()) {
        const storableSubnodes = this.subnodes().filter(sn => sn.shouldStore())
        const pids = storableSubnodes.map(sn => { 
            aStore.willRefObject(sn)
            return sn.pid()
        })
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

    // ----------------------------------------
    // new store system
    // ----------------------------------------

    recordForStore: function(aStore) { // should only be called by Store
        const dict = {}

        Object.keys(this.storedSlots()).forEach((k) => {
            const v = this.getStoreSlotValue(k)
            dict[k] = aStore.refValue(v)
        })

        return {
            type: this.type(), 
            dict: dict, 
        }
    },

    instanceFromRecordInStore: function(aRecord, aStore) { // should only be called by Store    
        const proto = window[aRecord.type]
        const obj = proto.clone()
        const dict = aRecord.dict

        Object.keys(aDict).forEach((k) => {
            if(!this.setStoreSlotValue(k, aDict[k], aStore)) {
                // slot was missing, so store it again without it
                if (!aStore.isReadyOnly()) {
                    this.scheduleSyncToStore()
                }
            }
        })

        return obj
    },

})
