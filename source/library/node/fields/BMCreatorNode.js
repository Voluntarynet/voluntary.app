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
            "BMMenuNode", 
            "BMActionNode", 
            "BMBooleanField", 
            "BMDateField", 
            //"BMIdentityField", 
            "BMImageWellField", 
            "BMStringField",
            "BMNumberField", 
            "BMMenuNode", 
            "BMOptionsField"
        ]
    },

    setupSubnodes: function() {
        const newSubnodes = this.fieldTypes().map((typeName) => {
            let name = typeName
            name = name.sansPrefix("BM")
            name = name.sansSuffix("Field")
            name = name.sansSuffix("Node")
            const newNode = BMActionNode.clone()
            newNode.setTitle(name).setTarget(this).setMethodName("didChoose").setInfo(typeName)
            //newNode.setCanDelete(true)
            return newNode
        })
        this.addSubnodes(newSubnodes)
        return this
    },

    didChoose: function(actionNode) {
        const typeName = actionNode.info()
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
})
