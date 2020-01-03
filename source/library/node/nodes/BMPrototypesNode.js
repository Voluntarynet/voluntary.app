"use strict"

/*

    BMPrototypesNode
 
 

*/

window.BMPrototypesNode = class BMPrototypesNodeode extends ProtoClass {
    
    initPrototype () {
        //this.newSlot(...)
    }

    init () {
        super.init()
        //this.setupSubnodes()
        return this
    }

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
        let primitives = BMMenuNode.clone().setTitle("Primitives")
        this.addSubnode(primitives)

        primitives.addSubnodes(this.primitiveSubnodes())
        return this
    }

}.initThisClass()

