"use strict"

/*

    BMOptionsNode 
    
*/

BMField.newSubclassNamed("BMOptionsNode").newSlots({
    allowsMultiplePicks: false,
    summaryFormat: "value",
}).setSlots({
    
    init: function () {
        BMField.init.apply(this)

        this.setShouldStore(true)
        this.addStoredSlot("key")
        this.setShouldStoreSubnodes(true)

        this.setCanDelete(true)
        this.setNodeCanInspect(true)
        this.addAction("add")
        this.setNodeMinWidth(300)

        this.setTitle("Options title")
        this.setKeyIsVisible(true)
        this.setNodeCanEditTitle(true)

        //this.setSubtitle("subtitle")
        //this.setNodeCanEditSubtitle(true)

        //this.setSubnodeProto(BMMenuNode)
        this.setSubnodeProto(BMOptionNode)
        this.setNodeCanReorderSubnodes(true)
        this.addStoredSlot("allowsMultiplePicks")


        //this.setViewClassName("BMOptionsNodeView")
    },

    initNodeInspector: function() {
        BMField.initNodeInspector.apply(this)
        this.addInspectorField(BMBooleanField.clone().setKey("Multiple picks").setValueMethod("allowsMultiplePicks").setValueIsEditable(true).setTarget(this))

        return this
    },
    
    /*
    summary: function() {
        let s = ""
        if (this.nodeSummaryShowsKey()) {
            s += this.title() + ": "
        }
        return s + this.childrenSummary()
    },
    */

    childrenSummary: function() {
        const picked = this.pickedSubnodes()
        if (picked.length === 0) {
            return "None"
        }
        return picked.map(subnode => subnode.summary()).join(this.nodeSummaryJoiner())
    },

    setSubtitle: function(aString) {
        return this
    },

    didToggleOption: function(anOptionNode) {
        if (anOptionNode.isPicked() && !this.allowsMultiplePicks()) {
            this.unpickSubnodesExcept(anOptionNode)
        }

        let pickedValues = this.pickedSubnodes().map(s => s.value())
        //this.setValue(pickedValues)
        
        if (pickedValues.length) {
            if (this.allowsMultiplePicks()) {
                this.setValue(pickedValues)
            } else {
                this.setValue(pickedValues.first())
            }
        } else {
            this.setValue(null)
        }

        return this
    },

    unpickSubnodesExcept: function(anOptionNode) {
        this.subnodes().forEach(subnode => {
            if (subnode !== anOptionNode) { 
                subnode.setIsPicked(false) 
            }
        })
        return this
    },

    pickedSubnodes: function() {
        return this.subnodes().select(subnode => subnode.isPicked())
    },

    acceptedSubnodeTypes: function() {
        return [BMOptionNode.type()]
    },
    
    note: function() {
        return "&gt;"
    },

    /*
    setValidValues: function(values) {        
        const options = values.map(v => BMOptionNode.clone().setValue(v))
        this.setSubnodes(options)
        return this
    },
	
    validValues: function() {
        return this.subnodes().map(sn => sn.value())
    },
    */
    
    nodeRowLink: function() {
        // used by UI row views to browse into next column
        return this
    },    
})
