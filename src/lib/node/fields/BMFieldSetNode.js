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
        
        
BMFieldSetNode = BMStorableNode.extend().newSlots({
    type: "BMFieldSetNode",
    status: "",
    isEditable: true,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setNodeMinWidth(500)
		this.setViewClassName("BrowserFieldsColumn")
		this.setShouldStoreSubnodes(false)
		//this.setViewClassName(null)
		//console.log("BMFieldSetNode viewClassName = '" + this.viewClassName() + "'")
    },        
    
	didUpdateField: function(aField) {
		
	},
	
    // --- fields ---

	addStoredField: function(aField) {
		var name = aField.nodeValueMethod()
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
		field.setNodeValueMethod(name)
		this.addStoredField(field)
        return field
    },
    
    fieldNamed: function(aName) {
        return this.subnodes().detect(function (subnode) { 
			return subnode.nodeValueMethod() == aName || subnode.key() == aName
        })
    },
    
    valueForFieldNamed: function(aName) {
        return this.fieldNamed(aName).value()
    },


	copyFieldsFrom: function(sourceObj) {
		this.subnodes().forEach((targetField) => {
			var sourceField = sourceObj.fieldNamed(targetField.nodeValueMethod())
			targetField.setValue(sourceField.value())
			//console.log("target field " + targetField.nodeValueMethod() + " set to '" + targetField.value() + "'")
		})
		return this
	},
    
    onDidEditNode: function() {
        this.markDirty()
        this.didUpdate()
    },

    /*
    syncToFields: function() {
        this.subnodes().forEach((field) => {
            var key = field.nodeValueMethod()
            
            if (key) {
                if (!this[key]) {
                    console.error("missing field key= '" + key + "'")
                } else {            
                    var value = this[key].apply(this)
                    console.log(this.type() + " found key= '" + key + "' with value '" + value + "'") 
                    //field.setKey(key)
                    field.setValue(value)
                }
            }
        })
    },
	*/

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
