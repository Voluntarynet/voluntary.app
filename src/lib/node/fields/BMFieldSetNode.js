"use strict"

/*
        FormNode is useful for node's which are to be viewed and interacted with as forms
        
        child nodes are of type BMField and should only be added via addFieldNamed()
                        
        example use in subclass 
    
        BMCustomFormNode = BMFieldSetNode.extend().newSlots({
            type: "BMCustomFormNode",
        }).setSlots({
        
        init: function () {
            BMFieldSetNode.init.apply(this)

            this.addFieldNamed("from")
            this.addFieldNamed("to")
            this.addFieldNamed("subject")
            this.addFieldNamed("body").setNodeMinHeight(-1)

            this.setActions(["send", "delete"])
        },
    
*/  
        

window.BMFieldSetNode = BMStorableNode.extend().newSlots({
    type: "BMFieldSetNode",
    status: "",
    isEditable: true,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setNodeMinWidth(500)
        //this.setViewClassName("BrowserFieldsColumn")
        this.setShouldStoreSubnodes(false)
        this.setNodeColumnBackgroundColor("white")
        //this.setViewClassName(null)
        //console.log("BMFieldSetNode viewClassName = '" + this.viewClassName() + "'")
    },        
    
    didUpdateField: function(aField) {
        // override to implement hooks
    },
	
    // --- fields ---

    addStoredField: function(aField) {
        let  name = aField.valueMethod()
        this.addStoredSlot(name)
        if (!this[name]) {
            this.newSlot(name, null)
        }
        this.justAddField(aField)
        return aField	
    },
	
    justAddField: function(aField) {
        this.addSubnode(aField)
        return aField
    },

    addFieldNamed: function(name) {	
        let  field = BMField.clone().setKey(name)
        field.setValueMethod(name)
        this.addStoredField(field)
        return field
    },
    
    fieldNamed: function(aName) {
        return this.subnodes().detect(function (subnode) { 
            return subnode.valueMethod() == aName || subnode.key() == aName
        })
    },
    
    valueForFieldNamed: function(aName) {
        return this.fieldNamed(aName).value()
    },

    copyFieldsFrom: function(sourceObj) {
        this.subnodes().forEach((targetField) => {
            let  sourceField = sourceObj.fieldNamed(targetField.valueMethod())
            targetField.setValue(sourceField.value())
            //console.log("target field " + targetField.valueMethod() + " set to '" + targetField.value() + "'")
        })
        return this
    },
    
    onDidEditNode: function() {
        this.scheduleSyncToStore()
        this.didUpdateNode()
    },

    validate: function() {
        return this.subnodes().detect((subnode) => { return !subnode.validate() }) != null
    },

    invalidSubnodes: function() {
        return this.subnodes().detect((subnode) => { subnode.validate() })
    },

    isValid: function() {
        return this.validate() // could cache this later...
    },

    // json serialization
    // todo: can this use persistent storage methods via skip pid use?

    asJSON: function() {
        let  dict = {}
        dict.type = this.type()
        // todo: store persistent slots...
        // todo: store subnodes if set to store them
        if (this.subnodes().length) { // todo: use a count method?
            // todo: check for BMField subclass?
            dict.fields = {}
            this.subnodes().forEach((field) => {
                let v = field.value()
                if (v) { // is empty or null value something we should store?
                    dict.fields[field.key()] = v
                }
            })
        }
        return dict
    },

    fromJSON: function(json) {
        // todo: read persistent keys
        if (json.fields) { 
            Map.withJsMap(json.fields).forEach((key, value) => {
                let  field = this.fieldNamed(key)
                if (field) {
                    field.setValue(value)
                }
            })
        }
        return this
    },
})
