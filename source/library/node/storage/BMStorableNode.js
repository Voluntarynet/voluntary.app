"use strict"

/*

    BMStorableNode 
    
*/

window.BMStorableNode = class BMStorableNode extends BMNode {
    
    initPrototype () {

        this.setShouldStore(false)
        //this.setShouldStoreSubnodes(true)
        this.overrideSlot("canDelete", false).setShouldStore(true)  // defined in BMNode, but we want to store it

        // subnodes
        
        const subnodesSlot = this.overrideSlot("subnodes", null)
        //subnodesSlot.setOwnsSetter(true)
        subnodesSlot.setShouldStore(true)
        subnodesSlot.setDoesHookGetter(true)
        subnodesSlot.setHookedGetterIsOneShot(true)
        subnodesSlot.setIsLazy(true)
        subnodesSlot.setInitProto(StorableArray)
        subnodesSlot.setupInOwner()
        
        this.newSlot("lazySubnodeCount", null).setShouldStore(true)
    }

    init () {
        super.init()
        //this.scheduleSyncToStore()
    }

    didUpdateSlotSubnodes (oldValue, newValue) {
        super.didUpdateSlotSubnodes(oldValue, newValue)

        /*
        if (!this.shouldStore() || !this.isInstance()) {
	        return this
        }
        */
        
        return this
    }

    // --- overrides from parent class ---
    // hook this to schedules writes when subnode list is changed

    updateLazySubnodeCount () {
        if (this._subnodes) {
            this.setLazySubnodeCount(this.subnodes().length)
        }
    }

    didChangeSubnodeList () {
        super.didChangeSubnodeList()
        this.updateLazySubnodeCount()

        if (this.shouldStoreSubnodes()) {
            this.scheduleSyncToStore()
        }
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
 
    // reading object from store

    // --- udpates ---
	
    didUpdateSlot (aSlot, oldValue, newValue) {
        super.didUpdateSlot(aSlot, oldValue, newValue)

	    if (!this.shouldStore() || !this.isInstance()) {
	        return this
	    }
	    
        if (aSlot.shouldStore()) { 
            this.scheduleSyncToStore()
        }
        
        // TODO: add a switch for this feature
        // TODO: find a way to avoid this?
        if (newValue !== null && this._subnodes && this._subnodes.includes(oldValue)) { 
            newValue.setParentNode(this)
            this.subnodes().replaceOccurancesOfWith(oldValue, newValue)
            //this.debugLog(" this.subnodes().replaceOccurancesOfWith(", oldValue, ",", newValue, ")")
        }
    }
	
    // subnodes
    
    subnodeCount () {
        if (!this._subnodes) {
            return this.lazySubnodeCount()
        }
        return this._subnodes.length
    }

    prepareForFirstAccess (aStore = this.defaultStore()) {
        super.prepareForFirstAccess()
        return this
    }

}.initThisClass()
