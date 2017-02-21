/*

        FormNode is useful for node's which are to be viewed and interacted with as forms
        
        child nodes are of type BMField and should only be added via addFieldNamed()
                
        when persisted, it's nodeDict method maps the child node values into the returned dict
        
        example use in subclass 
    
        BMCustomFormNode = BMFormNode.extend().newSlots({
            type: "BMCustomFormNode",
        }).setSlots({
        
        init: function () {
            BMFormNode.init.apply(this)

            this.addFieldNamed("from")
            this.addFieldNamed("to")
            this.addFieldNamed("subject")
            this.addFieldNamed("body").setNodeMinHeight(-1)

            this.setActions(["send", "delete"])
        },
    
*/  
        
        
BMFormNode = BMStorableNode.extend().newSlots({
    type: "BMFormNode",
    status: "",
    isEditable: true,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        //this.setNodeRowViewClassName("BrowserFieldRow")
        this.setNodeRowViewClassName("BrowserFieldRow")
        this.setNodeMinWidth(500)
    },        
    
    // --- fields ---
    
    addFieldNamed: function(name) {
        var field = BMNode.clone().setTitle("").setSubtitle(name)
        field.setNodeTitleIsEditable(true)
        field.setNodeRowViewClassName("BrowserFieldRow")
        this.addItem(field)
        return field
    },
    
    fieldNamed: function(name) {
        return this.items().detect(function (item) { 
            return item.subtitle() == name 
        })
    },
    
    valueForFieldNamed: function(aName) {
        return this.fieldNamed(aName).title()
    },
    
    // --- peristence - save items as fields in dict ---
    
    nodeDict: function () {
        var dict = BMStorableNode.nodeDictForProperties.apply(this)
        
        var self = this
        this.items().forEach(function(item) {
            dict[item.subtitle()] = item.title()
        })
        
        return dict
    },

    setNode: function(aNode) {
        BMStorableNode.setNode.apply(this, [aNode])
        this.syncFields()
        return this
    },
        
    setNodeDict: function(dict) {
        var self = this
        this.items().forEach(function(item) {
            item.setTitle(dict[item.subtitle()])
        })        
        
        //this.syncFields()

        return this
    },
    
    onDidEditNode: function() {
        this.markDirty()
        this.didUpdate()
    },
    
    syncFields: function() {
        var self = this
        this.items().forEach(function(field) {
            var key = field.nodeFieldProperty()
            
            if (key) {
                if (!self[key]) {
                    console.error("missing field key= '" + key + "'")
                    field.setTitle("missing field key= '" + key + "'")
                } else {            
                    console.log("found key= '" + key + "'") 
                    var value = self[key].apply(this)
                    field.setTitle(value)
                }
            }
        })
    },
})
