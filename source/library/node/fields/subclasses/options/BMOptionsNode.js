"use strict"

/*

    BMOptionsNode 
    
*/

BMField.newSubclassNamed("BMOptionsNode").newSlots({
    allowsMultiplePicks: false,
}).setSlots({
    
    init: function () {
        BMField.init.apply(this)

        this.setShouldStore(true)
        this.addStoredSlot("title")
        this.setShouldStoreSubnodes(true)

        this.setCanDelete(true)
        this.setNodeCanInspect(true)
        this.addAction("add")
        this.setNodeMinWidth(300)

        this.setTitle("title")
        this.setNodeCanEditTitle(true)

        //this.setSubtitle("subtitle")
        //this.setNodeCanEditSubtitle(true)

        //this.setSubnodeProto(BMMenuNode)
        this.setSubnodeProto(BMOptionNode)
        this.setNodeCanReorderSubnodes(true)
        this.addStoredSlot("allowsMultiplePicks")
        this.addStoredSlot("nodeSubtitleIsChildrenSummary")
        this.addStoredSlot("nodeSummaryShowsValue")
        this.addStoredSlot("nodeSummaryShowsKey")

        //this.setViewClassName("BMOptionsNodeView")
    },

    initNodeInspector: function() {
        BMField.initNodeInspector.apply(this)
        this.addInspectorField(BMBooleanField.clone().setKey("Allows multiple picks").setValueMethod("allowsMultiplePicks").setValueIsEditable(true).setTarget(this))
        return this
    },
    

    summary: function() {
        let s = ""
        if (this.nodeSummaryShowsKey()) {
            s += this.title() + ": "
        }
        return s + this.childrenSummary()
    },

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
