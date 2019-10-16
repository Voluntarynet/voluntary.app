"use strict"

/*

    BMOptionsNode 
    
*/

BMField.newSubclassNamed("BMOptionsNode").newSlots({

}).setSlots({
    
    init: function () {
        BMStorableNode.init.apply(this)

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

        //this.setViewClassName("BMOptionsNodeView")
    },

    subtitle: function() {
        return this.selectedSubnodes().map(subnode => subnode.title()).join(", ")
    },

    setSubtitle: function(aString) {
        return this
    },

    selectedSubnodes: function() {
        return this.subnodes().select(subnode => subnode.isSelected())
    },    

    acceptedSubnodeTypes: function() {
        return [BMOptionNode.type()]
    },
    
    note: function() {
        return "&gt;"
    },

    setValidValues: function(values) {        
        const options = values.map(v => BMOptionNode.clone().setValue(v))
        this.setSubnodes(options)
        return this
    },
	
    validValues: function() {
        return this.subnodes().map(sn => sn.value())
    },
    
    nodeRowLink: function() {
        // used by UI row views to browse into next column
        return this
    },    
})
