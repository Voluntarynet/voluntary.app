"use strict"

/*
    
    BMLinkNode
    
    A node that to represent a link to another node, which is not a subnode
    
*/

window.BMLinkNode = class BMLinkNode extends BMSummaryNode {
    
    initPrototype () {
        this.newSlot("label", "link title").setShouldStore(true)
        this.newSlot("linkedNode", null).setShouldStore(true)

        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setCanDelete(true)
        this.setNodeCanInspect(true)
        this.setNodeMinWidth(300)

        this.setTitle("title of link") // TODO: add option to use title of linked node?
        this.setNodeCanEditTitle(true)

        this.setCanDelete(true)
        this.setNodeCanInspect(true) 
    }

    init () {
        super.init()
    }

    title () {
        if (Type.isNull(this.label()) && this.linkedNode()) {
            return this.linkedNode().title()
        }
        return this.label()
    }

    setTitle (aString) {
        this.setLabel(aString)
        return this
    }

    acceptedSubnodeTypes () {
        return []
    }
    
    note () {
        return this.nodeRowLink() ? "&gt;" : null
    }

    nodeRowLink () {
        return this.linkedNode()
    }

}.initThisClass()

