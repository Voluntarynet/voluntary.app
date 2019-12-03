"use strict"

/*
    
    BMLinkNode
    
    A node that to represent a link to another node, which is not a subnode
    
*/

window.BMLinkNode = class BMLinkNode extends BMSummaryNode {
    
    initPrototype () {
        this.overrideSlot("title", null).setShouldStore(true)
        this.newSlot("linkedNode", null).setShouldStore(true)

        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setCanDelete(true)
        this.setNodeCanInspect(true)
        this.setNodeMinWidth(300)

        this.setNodeCanEditTitle(true)

        this.setCanDelete(true)
        this.setNodeCanInspect(true) 
    }

    init () {
        super.init()
    }

    title () {
        return this.linkedNode().title()
    }

    /*
    title () {
        if (Type.isNull(super.title()) && this.linkedNode()) {
            return this.linkedNode().title()
        }

        return super.title()
    }
    */

    acceptedSubnodeTypes () { 
        // TODO: have browser use nodeRowLink for this protocol?
        return []
    }
    
    note () {
        if (this.linkedNode()) {
            return this.linkedNode().note()
        }

        return this.nodeRowLink() ? "&gt;" : null
    }

    nodeRowLink () {
        return this.linkedNode()
    }

}.initThisClass()

