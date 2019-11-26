"use strict"

/*

    BMCreatorNode
    
    A stand-in node that let's the user select field to replace it with.

*/
        
BMStorableNode.newSubclassNamed("BMCreatorNode").newSlots({
}).setSlots({

}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setNodeCanEditTitle(false)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(false)
        this.setNodeCanReorderSubnodes(false)
        this.setupSubnodes()
        this.setCanDelete(true)
    },

    title: function() {
        return "Choose type"
    },

    /*
    note: function() {
        return "&gt;"
    },
    */

    /*
    acceptsSubnodesOfTypes: function() {
        return this.fieldTypes()
    },
    */

    fieldTypes: function() {
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
        ]
    },

    setupSubnodes: function() {
        const newSubnodes = this.fieldTypes().map((typeName) => {
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
        this.addSubnodes(newSubnodes)
        return this
    },

    onRequestSelectionOfDecendantNode: function(aNode) {
        const typeName = aNode._createTypeName
        if (typeName) {
            this.createType(typeName)
        }
        return true
    },

    didChoose: function(actionNode) {
        const typeName = actionNode.info()
        this.createType(typeName)
        return this
    },

    createType: function(typeName) {
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
    },

    note: function() {
        return "&gt;"
    },
    
}).initThisProto()
