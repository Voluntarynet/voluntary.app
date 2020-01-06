"use strict"

/*

    BMYearNode 
    
*/

window.BMYearNode = class BMYearNode extends BMNode {
    
    initPrototype () {
        this.newSlot("allowsMultiplePicks", false)
        this.newSlot("value", 0)
    }

    init () {
        super.init()

        this.setCanDelete(true)
        this.setNodeMinWidth(300)

        this.setNodeCanEditTitle(true)

        //this.setSubnodeProto(BMMenuNode)
        this.setSubnodeProto(BMOptionNode)
        this.setNodeCanReorderSubnodes(true)

        //this.setViewClassName("BMOptionsNodeView")
    }

    title () {
        return this.value()
    }

    hasSubnodes () {
        return true;
    }
    
    prepareToAccess () {
        //console.log("this.storeHasChanged() = ", this.storeHasChanged())
        if (this.subnodeCount() === 0) {
            //this.refreshSubnodes()
        }
    }
    
    nodeRowLink () {
        // used by UI row views to browse into next column
        return this
    }

    prepareToSyncToView () {
        // called after Node is selected
        if (!this.subnodeCount()) {
            for (let i = 1; i < 12 + 1; i++) {
                this.addSubnode(BMMonthNode.clone().setValue(i))
            }
        }
    }
    
}.initThisClass()
