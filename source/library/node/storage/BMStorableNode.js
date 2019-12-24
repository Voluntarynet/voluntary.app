"use strict"

/*

    BMStorableNode 
    
*/

window.BMStorableNode = class BMStorableNode extends BMNode {
    
    initPrototype () {
        this.setShouldStore(false)
        //this.setShouldStoreSubnodes(true)
        this.overrideSlot("canDelete", false).setShouldStoreSlot(true)  // defined in BMNode, but we want to store it

        this.setShouldStore(true)

        // subnodes
        
        const subnodesSlot = this.overrideSlot("subnodes", null)
        //subnodesSlot.setOwnsSetter(true)
        subnodesSlot.setShouldStoreSlot(true)
        subnodesSlot.setDoesHookGetter(true)
        subnodesSlot.setHookedGetterIsOneShot(true)
        subnodesSlot.setIsLazy(true)
        subnodesSlot.setInitProto(SubnodesArray)
        subnodesSlot.setupInOwner()
        
        this.newSlot("lazySubnodeCount", null).setShouldStoreSlot(true)
    }

    // --- udpates ---
	
    didUpdateSlot (aSlot, oldValue, newValue) {
        super.didUpdateSlot(aSlot, oldValue, newValue)

	    if (!this.shouldStore() || !this.isInstance()) {
	        return this
	    }
	    
        if (aSlot.shouldStoreSlot()) { 
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

    /*
    didUpdateSlotSubnodes (oldValue, newValue) {
        super.didUpdateSlotSubnodes(oldValue, newValue)
        this.updateLazySubnodeCount()        
        return this
    }
    */

    updateLazySubnodeCount () {
        if (this._subnodes) {
            this.setLazySubnodeCount(this.subnodes().length)
        }
    }

    didChangeSubnodeList () {
        super.didChangeSubnodeList()
        this.updateLazySubnodeCount()
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
