"use strict"

/*

    BMYearNode 
    
*/

BMNode.newSubclassNamed("BMYearNode").newSlots({
    allowsMultiplePicks: false,
    value: 0,
}).setSlots({
    
    init: function () {
        BMNode.init.apply(this)

        this.setCanDelete(true)
        this.setNodeMinWidth(300)

        this.setNodeCanEditTitle(true)

        //this.setSubnodeProto(BMMenuNode)
        this.setSubnodeProto(BMOptionNode)
        this.setNodeCanReorderSubnodes(true)

        //this.setViewClassName("BMOptionsNodeView")
    },

    title: function() {
        return this.value()
    },

    hasSubnodes: function() {
        return true;
    },
    
    prepareToAccess: function () {
        //console.log("this.storeHasChanged() = ", this.storeHasChanged())
        if (this.subnodeCount() === 0) {
            //this.refreshSubnodes()
        }
    },
    
    nodeRowLink: function() {
        // used by UI row views to browse into next column
        return this
    },    

    prepareToSyncToView: function() {
        // called after Node is selected
        if (!this.subnodeCount()) {
            for (let i = 1; i < 12 + 1; i++) {
                this.addSubnode(BMMonthNode.clone().setValue(i))
            }
        }
    },
    
}).initThisProto()
