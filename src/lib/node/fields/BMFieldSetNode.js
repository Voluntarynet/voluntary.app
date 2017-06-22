/*
        FormNode is useful for node's which are to be viewed and interacted with as forms
        
        child nodes are of type BMField and should only be added via addFieldNamed()
                
        when persisted, it's nodeDict method maps the child node values into the returned dict
        
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
		this.setViewClassName("BMFieldSetView")
		this.setShouldStoreItems(false)
		//this.setViewClassName(null)
		//console.log("BMFieldSetNode viewClassName = '" + this.viewClassName() + "'")
    },        
    
    // --- fields ---

	addField: function(field) {
		var name = field.nodeFieldProperty()
		this.addStoredSlot(name)
		this.newSlot(name, null);
		this.addItem(field)
		return field	
	},

    addFieldNamed: function(name) {	
        var field = BMField.clone().setKey(name)
		field.setNodeFieldProperty(name)
		this.addField(field)
        return field
    },
    
    fieldNamed: function(aName) {
        return this.items().detect(function (item) { 
			return item.nodeFieldProperty() == aName || item.key() == aName
        })
    },
    
    valueForFieldNamed: function(aName) {
        return this.fieldNamed(aName).value()
    },


	copyFieldsFrom: function(sourceObj) {
		this.items().forEach((targetField) => {
			var sourceField = sourceObj.fieldNamed(targetField.nodeFieldProperty())
			targetField.setValue(sourceField.value())
			//console.log("target field " + targetField.nodeFieldProperty() + " set to '" + targetField.value() + "'")
		})
		return this
	},
    
    onDidEditNode: function() {
        this.markDirty()
        this.didUpdate()
    },

    /*
    syncToFields: function() {
        this.items().forEach((field) => {
            var key = field.nodeFieldProperty()
            
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
		return this.items().detect((item) => { return !item.validate() }) != null
		
		/*
		var isValid = true

		this.items().forEach((item) => { 
			if (!item.validate()) {
				isValid = false
			}
		})
	
		return isValid
		*/
	},

	invalidItems: function() {
		return this.items().detect((item) => { item.validate() })
	},

	isValid: function() {
		return this.validate() // could cache this later...
	},
})
