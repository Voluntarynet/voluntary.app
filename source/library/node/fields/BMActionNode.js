"use strict"

/*

    BMActionNode
    
    An abstraction of a UI visible action that can be performed on an object.
    the value is the action method name, the target is the field owner.

*/

window.BMActionNode = class BMActionNode extends BMStorableNode {
    
    initPrototype () {
        this.overrideSlot("title", null).setShouldStoreSlot(true)
        this.newSlot("methodName", null).setShouldStoreSlot(true)
        this.newSlot("info", null).setShouldStoreSlot(true)
        this.newSlot("isEnabled", true).setShouldStoreSlot(true)
        this.newSlot("isEditable", false).setShouldStoreSlot(true)
        this.newSlot("target", null)
        this.setShouldStore(true)
        this.setNodeRowIsSelectable(true)
    }

    init () {
        super.init()
    }

    setTitle (s) {
        super.setTitle(s)
        return this
    }

    initNodeInspector () {
        super.initNodeInspector()

        const titleField = BMField.clone().setKey("title").setValueMethod("title").setValueIsEditable(true).setTarget(this)
        this.nodeInspector().addSubnode(titleField)

        // enabled
        // shows title
    }

    canDoAction () {
        const t = this.target()
        const m = this.methodName()
        return t && t[m]
    }

    doAction () {
        if (this.canDoAction()) {
            const func = this.target()[this.methodName()]
            
            if (Type.isFunction(func)) {
                func.apply(this.target(), [this])
            } else {
                //this.setValueError("no method with this name")
                console.warn("no method with this name")
            }
        } else {
            this.debugLog(" can't perform action ", this.methodName(), " on ", this.target())
        }
	    
	    return this
    }
    
}.initThisClass()
