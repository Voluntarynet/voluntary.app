"use strict"

/*

    BMOptionNode
    
    A single option from a set of options choices.

*/
        
window.BMOptionNode = class BMOptionNode extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
            label: "Option Title",
            value:  null,
            isPicked: false,
        })
    }

    init () {
        super.init()
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setNodeCanReorderSubnodes(false)
        this.setCanDelete(true)
        this.addStoredSlot("label")
        this.addStoredSlot("value")
        this.addStoredSlot("isPicked")
        this.setNodeCanEditTitle(true)
    }

    shallowCopySlotnames () {
        const names = super.shallowCopySlotnames()
        return names.appendItems([
            "label", "value", "isPicked", 
        ])
    }

    setIsPicked (aBool) {
        if (this.isPicked() !== aBool) {
            this._isPicked = aBool
            if (this.parentNode()) {
                this.parentNode().didToggleOption(this)
                this.didUpdateNode()
                this.scheduleSyncToStore()
            }
        }
        return this
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
