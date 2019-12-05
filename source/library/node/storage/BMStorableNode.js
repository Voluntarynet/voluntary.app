"use strict"

/*

    BMStorableNode 
    
*/

window.BMStorableNode = class BMStorableNode extends BMNode {
    
    initPrototype () {

        this.setShouldStore(false)
        //this.setShouldStoreSubnodes(true)
        this.overrideSlot("canDelete", false).setShouldStore(true)  // defined in BMNode, but we want to store it
        this.overrideSlot("subnodes", null).setShouldStore(true).setDoesHookGetter(true).setHookedGetterIsOneShot(true)
        this.newSlot("lazySubnodeCount", null).setShouldStore(true)
    }

    init () {
        super.init()
        //this.scheduleSyncToStore()
    }

    // --- overrides from parent class ---
    // hook this to schedules writes when subnode list is changed

    updateLazySubnodeCount () {
        this.setLazySubnodeCount(this.subnodes().length)
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
	    if (!this.shouldStore() || !this.isInstance()) {
	        return this
	    }
	    
        // check so we don't mark dirty while loading
        // and use private slots directly for performance
        if (this.storedSlotNamesSet().has(slotName)) { // WARNING: THIS IS SLOW - use setter hook instead?
            //this.debugLog(".didUpdateSlot(" + slotName + ",...) -> scheduleSyncToStore")
            this.scheduleSyncToStore()
        }
		
        if (newValue !== null && this._subnodes && this._subnodes.includes(oldValue)) { // TODO: add a switch for this feature
            newValue.setParentNode(this)
            this.subnodes().replaceOccurancesOfWith(oldValue, newValue)
            //this.debugLog(" this.subnodes().replaceOccurancesOfWith(", oldValue, ",", newValue, ")")
        }
    }
	
    // subnodes

    willGetSlotSubnodes () {
        if (!this._subnodes) {
            //this.slotNamed("subnodes").onInstanceUnref(this)
        }
    }
    
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
