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
		return null
    },
    
    valueForFieldNamed: function(aName) {
        return this.fieldNamed(aName).value()
    },
    
    // --- peristence - save items as fields in dict ---
    /*
	
    nodeDict: function () {
        var dict = BMStorableNode.nodeDictForProperties.apply(this)
        
        var self = this
        this.items().forEach(function(item) {
            dict[item.key()] = item.value()
        })
        
        return dict
    },

    setNode: function(aNode) {
        BMStorableNode.setNode.apply(this, [aNode])
        //this.syncToFields()
        return this
    },
        
    setNodeDict: function(dict) {
        var self = this
        this.items().forEach(function(item) {
            item.setValue(dict[item.key()])
        })        
        
        //this.syncFields()

        return this
    },
*/
    
    onDidEditNode: function() {
        this.markDirty()
        this.didUpdate()
    },
    /*
    syncToFields: function() {
        var self = this
        this.items().forEach(function(field) {
            var key = field.nodeFieldProperty()
            
            if (key) {
                if (!self[key]) {
                    console.error("missing field key= '" + key + "'")
                } else {            
                    var value = self[key].apply(self)
                    console.log(self.type() + " found key= '" + key + "' with value '" + value + "'") 
                    //field.setKey(key)
                    field.setValue(value)
                }
            }
        })
    },
*/
})
