"use strict"

/*

    BMFieldSetNode

    Useful for node's which are to be viewed and interacted with as forms
    
    child nodes are of type BMField and should only be added via addFieldNamed()
    This method sets the target of the field to this and the method to the field name.
                    
    example use in subclass 

    in BMCustomFormNode class:
    
        init () {
            super.init()

            this.addFieldNamed("from")
            this.addFieldNamed("to")
            this.addFieldNamed("subject")
            this.addFieldNamed("body").setNodeMinRowHeight(-1)

            this.setActions(["send"])
            this.setCanDelete(true)
        }

        ...

*/  
        
window.BMFieldSetNode = class BMFieldSetNode extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
            status: "",
            isEditable: true,
        })
    }

    init () {
        super.init()
        this.setNodeMinWidth(500)
        this.setShouldStoreSubnodes(false)
        //this.setNodeColumnBackgroundColor("white")
    }
    
    didUpdateField (aField) {
        // override to implement hooks
    }
	
    // --- fields ---

    /*
    protoAddStoredField (aField) { 
        assert(this.isPrototype())

        const slot = this.slotNamed(aField.valueMethod())
        const name = slot.name()

        // set store to should store, hooks setter
        this.protoAddStoredSlot(name)

        // add a slot
        if (!this[name]) {
            this.newSlot(name, null)
        }

        // add field to subnodes and setTarget(this)
        this.addField(aField)
        return aField
    }

    */

    addField (aField) {
        aField.setTarget(this) 
        aField.getValueFromTarget()
        this.addSubnode(aField)
        return aField
    }

    addFieldNamed (name) {	
        const field = BMField.clone().setKey(name)
        field.setTarget(this)
        field.setValueMethod(name)
        this.addStoredField(field)
        return field
    }
    
    fieldNamed (aName) {
        return this.subnodes().detect( (subnode) => { 
            return subnode.valueMethod() === aName || subnode.key() === aName
        })
    }
    
    /*
    valueForFieldNamed (aName) {
        return this.fieldNamed(aName).value()
    }
    */

    onDidEditNode () {
        this.scheduleSyncToStore()
        this.didUpdateNode()
    }

    // --- validation ---

    validate () {
        return this.invalidSubnodes().length === 0
    }

    invalidSubnodes () {
        return this.subnodes().select(subnode => !subnode.validate())
    }

    isValid () {
        return this.validate() // could cache this later...
    }

    // --- json serialization ---
    // TODO: can this use persistent storage methods via skip pid use?

    /*
    asJSON () {
        const dict = {}
        dict.type = this.type()
        // TODO: store persistent slots...
        // TODO: store subnodes if set to store them
        if (this.hasSubnodes()) { // TODO: use a count method?
            // TODO: check for BMField subclass?
            dict.fields = {}
            this.subnodes().forEach((field) => {
                const v = field.value()
                if (v) { // is empty or null value something we should store?
                    dict.fields.atPut(field.key(), v)
                }
            })
        }
        return dict
    }

    fromJSON (json) {
        // TODO: read persistent keys
        if (json.fields) { 
            Map.withJsDict(json.fields).forEach((key, value) => {
                const field = this.fieldNamed(key)
                if (field) {
                    field.setValue(value)
                }
            })
        }
        return this
    }
    */
}.initThisClass()
