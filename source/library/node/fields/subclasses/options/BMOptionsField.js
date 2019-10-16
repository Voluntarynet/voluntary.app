"use strict"

/*

    BMOptionsField 
    
*/

BMField.newSubclassNamed("BMOptionsField").newSlots({

}).setSlots({
    
    init: function () {
        BMField.init.apply(this)
        //this.setViewClassName("BMOptionsFieldView")

        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
        this.setCanDelete(true)
        this.setNodeCanInspect(true)
        this.addAction("add")
        this.setNodeMinWidth(300)

        this.setTitle("options title")
        this.setNodeCanEditTitle(true)

        //this.setSubtitle("subtitle")
        this.setNodeCanEditSubtitle(false)

        this.setSubnodeProto(BMOptionNode)
        
        this.setNodeCanReorderSubnodes(true)
        return this
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
