"use strict"

/*

    BMOptionNode
    
    A single option from a set of options choices.

*/
        
window.BMOptionNode = class BMOptionNode extends BMStorableNode {
    
    initPrototype () {
        this.newSlot("label", "Option Title").setShouldStoreSlot(true).setDuplicateOp("copyValue")
        this.newSlot("value", null).setShouldStoreSlot(true).setDuplicateOp("copyValue")
        this.newSlot("isPicked", false).setShouldStoreSlot(true).setDuplicateOp("copyValue")

        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setNodeCanReorderSubnodes(false)
        this.setCanDelete(true)
        this.setNodeCanEditTitle(true)
    }

    init () {
        super.init()
    }


    didUpdateSlotIsPicked (oldValue, newValue) {
        if (this.parentNode()) {
            this.parentNode().didToggleOption(this)
            this.didUpdateNode()
            this.scheduleSyncToStore()
        }
    }

    toggle () {
        this.setIsPicked(!this.isPicked())
        return this
    }

    title () {
        return this.label()
    }

    value () {
        return this.title()
    }

    setTitle (aString) {
        this.setLabel(aString)
        return this
    }

    subtitle () {
        return null
    }

    summary () {
        return this.title()
    }

    note () {
        return this.isPicked() ? "✓" : ""
    }

}.initThisClass()
