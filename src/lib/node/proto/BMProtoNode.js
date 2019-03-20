"use strict"

/*

    BMProtoNode
    
*/

window.BMProtoNode = BMNode.extend().newSlots({
    type: "BMProtoNode",
    protoValue: Proto,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        //this.setViewClassName("GenericView")
        //this.setViewClassName("BMDataStoreRecordView")
        //this.addAction("delete")
        this.setNodeMinWidth(300)
        //this.setNoteIsSubnodeCount(true)
    },

    title: function () {
        if (this.protoValue()) {
            return this.protoValue().type()
        }

        return "?"
    },

    nodeNode: function() {
        return "&gt;"
    },

    subtitle: function () {
  
        return null
    },

    setupSubnodes: function() {
        let childNodes = [
            BMSlotsNode.clone().setProtoValue(this.protoValue()), 
            BMSubclassesNode.clone().setProtoValue(this.protoValue())
        ]

        this.setSubnodes(childNodes);
        return this
    },

    prepareToAccess: function () {
        //console.log(this.typeId() + " prepareToAccess this.protoValue() = ", this.protoValue().type())
        if (this._subnodes.length === 0) {
            this.setupSubnodes()
        }
    },
})

