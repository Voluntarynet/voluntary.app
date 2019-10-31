"use strict"

/*

    BMFieldSetNode

    Useful for node's which are to be viewed and interacted with as forms
    
    child nodes are of type BMField and should only be added via addFieldNamed()
    This method sets the target of the field to this and the method to the field name.
                    
    example use in subclass 

    BMFieldSetNode.newSubclassNamed("BMCustomFormNode").newSlots({
    }).setSlots({
    
        init: function () {
            BMFieldSetNode.init.apply(this)

            this.addFieldNamed("from")
            this.addFieldNamed("to")
            this.addFieldNamed("subject")
            this.addFieldNamed("body").setNodeMinRowHeight(-1)

            this.setActions(["send"])
            this.setCanDelete(true)
        },

        ...

*/  
        

BMStorableNode.newSubclassNamed("BMFieldSetNode").newSlots({
    status: "",
    isEditable: true,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setNodeMinWidth(500)
        this.setShouldStoreSubnodes(false)
        //this.setNodeColumnBackgroundColor("white")
    },        
    
    didUpdateField: function(aField) {
        // override to implement hooks
    },
	
    // --- fields ---

    addStoredField: function(aField) {
        const name = aField.valueMethod()
        this.addStoredSlot(name)
        if (!this[name]) {
            this.newSlot(name, null)
        }

        this.justAddField(aField)
        return aField
    },

    addField: function(aField) {
        return this.justAddField(aField)
    },
	
    justAddField: function(aField) {
        aField.setTarget(this)
        this.addSubnode(aField)
        return aField
    },

    addFieldNamed: function(name) {	
        const field = BMField.clone().setKey(name)
        field.setTarget(this)
        field.setValueMethod(name)
        this.addStoredField(field)
        return field
    },
    
    fieldNamed: function(aName) {
        return this.subnodes().detect(function (subnode) { 
            return subnode.valueMethod() === aName || subnode.key() === aName
        })
    },
    
    valueForFieldNamed: function(aName) {
        return this.fieldNamed(aName).value()
    },

    /*
    copyFieldsFrom: function(sourceObj) {
        this.subnodes().forEach((targetField) => {
            const sourceField = sourceObj.fieldNamed(targetField.valueMethod())
            targetField.setValue(sourceField.value())
            //console.log("target field " + targetField.valueMethod() + " set to '" + targetField.value() + "'")
        })
        return this
    },
    */
    
    onDidEditNode: function() {
        this.scheduleSyncToStore()
        this.didUpdateNode()
    },

    // --- validation ---

    validate: function() {
        return this.invalidSubnodes().length === 0
    },

    invalidSubnodes: function() {
        return this.subnodes().select(subnode => !subnode.validate())
    },

    isValid: function() {
        return this.validate() // could cache this later...
    },

    // --- json serialization ---
    // TODO: can this use persistent storage methods via skip pid use?

    /*
    asJSON: function() {
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
                    dict.fields[field.key()] = v
                }
            })
        }
        return dict
    },

    fromJSON: function(json) {
        // TODO: read persistent keys
        if (json.fields) { 
            Map.withJsMap(json.fields).forEach((key, value) => {
                const field = this.fieldNamed(key)
                if (field) {
                    field.setValue(value)
                }
            })
        }
        return this
    },
    */
})
