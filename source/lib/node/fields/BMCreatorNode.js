"use strict"

/*

    BMCreatorNode
    
    A stand-in node that let's the user select field to replace it with.

*/
        
window.BMCreatorNode = BMStorableNode.extend().newSlots({
    type: "BMCreatorNode",
}).setSlots({

}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStoreSubnodes(false)
        this.setupSubnodes()
        this.setNodeCanReorderSubnodes(false)
        //this.addAction("delete")
        //this.setCanDelete(true)
    },

    title: function() {
        return "Choose type"
    },

    /*
    note: function() {
        return "&gt;"
    },
    */

    fieldTypes: function() {
        return [
            "BMFlexNode", 
            "BMActionNode", 
            "BMBoolField", 
            "BMDateField", 
            //"BMIdentityField", 
            "BMImageWellField", 
            "BMNumberField", 
            "BMFlexNode", 
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
        this.parentNode().replaceSubnodeWith(this, newNode)

        if (newNode.setKeyIsEditable) {
            newNode.setKeyIsEditable(true)
            newNode.setValueIsEditable(true)
        }

        if (newNode.setIsEditable) {
            newNode.setIsEditable(true)
        }

        newNode.setNodeTitleIsEditable(true)
       

        return this
    },
})
