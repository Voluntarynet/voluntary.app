"use strict"

/*

    BMCreatorNode
    
    A stand-in node that let's the user select field to replace it with.

*/
        
window.BMCreatorNode = class BMCreatorNode extends BMStorableNode {
    
    initPrototype () {
        this.overrideSlot("subnodes").setShouldStoreSlot(false)
    }

    init () {
        super.init()
        this.setNodeCanEditTitle(false)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setNodeCanReorderSubnodes(false)
        this.setupSubnodes()
        this.setCanDelete(true)
    }

    title () {
        return "Choose type"
    }

    /*
    note () {
        return "&gt;"
    }
    */

    /*
    acceptsSubnodesOfTypes () {
        return this.fieldTypes()
    }
    */

    static fieldTypes () {
        return [
            "BMActionNode", 
            "BMBooleanField", 
            //"BMDateField", 
            "BMDateNode",
            //"BMIdentityField", 
            "BMImageWellField", 
            "BMMenuNode", 
            "BMNumberField", 
            "BMOptionsNode",
            "BMStringField",
            "BMTextAreaField",
            "BMTextNode",
            "BMTimeNode",
            "BMLinkNode",
        ]
    }

    primitiveSubnodes () {
        const primitiveNodes = this.thisClass().fieldTypes().map((typeName) => {
            let name = typeName
            name = name.sansPrefix("BM")
            name = name.sansSuffix("Field")
            name = name.sansSuffix("Node")
            //const newNode = BMActionNode.clone()
            //newNode.setTitle(name).setTarget(this).setMethodName("didChoose").setInfo(typeName)

            const newNode = BMNode.clone()
            newNode.setTitle(name) //.setActionTarget(this).setAction("didChoose")
            newNode._createTypeName = typeName
            return newNode
        })

        return primitiveNodes
    }

    setupSubnodes () {
        this.addSubnodes(this.primitiveSubnodes())
        return this
    }

    onRequestSelectionOfDecendantNode (aNode) {
        const typeName = aNode._createTypeName
        if (typeName) {
            this.createType(typeName)
        }
        return true
    }

    didChoose (actionNode) {
        const typeName = actionNode.info()
        this.createType(typeName)
        return this
    }

    createType (typeName) {
        const proto = window[typeName]
        const newNode = proto.clone()

        if (newNode.setKeyIsEditable) {
            newNode.setKeyIsEditable(true)
            newNode.setValueIsEditable(true)
        }

        if (newNode.setIsEditable) {
            newNode.setIsEditable(true)
        }

        newNode.setCanDelete(true)
        newNode.setNodeCanInspect(true)
        newNode.setNodeCanEditTitle(true)
        //this.column().selectThisColumn()

        this.parentNode().replaceSubnodeWith(this, newNode)

        return this
    }

    note () {
        return "&gt;"
    }
    
}.initThisClass()
