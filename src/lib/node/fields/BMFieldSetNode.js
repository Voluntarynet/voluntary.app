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
		this.setNodeBackgroundColor("white")
		//this.setViewClassName(null)
		//console.log("BMFieldSetNode viewClassName = '" + this.viewClassName() + "'")
    },        
    
	didUpdateField: function(aField) {
		
	},
	
    // --- fields ---

	addStoredField: function(aField) {
		var name = aField.valueMethod()
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
        var field = BMField.clone().setKey(name)
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
			var sourceField = sourceObj.fieldNamed(targetField.valueMethod())
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
})
