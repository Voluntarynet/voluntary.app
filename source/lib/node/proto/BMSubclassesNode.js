"use strict"

/*

    BMSubclassesNode

*/

window.BMSubclassesNode = BMNode.extend().newSlots({
    type: "BMSubclassesNode",
    protoValue: null,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        //this.setViewClassName("GenericView")
        //this.setViewClassName("BMDataStoreRecordView")
        //this.setCanDelete(true)
        this.setNodeMinWidth(300)
        this.setNoteIsSubnodeCount(true)
        //this.setupSubnodes()
    },

    title: function () {
        return "subclasses"
    },

    subtitle: function () {
        return null
    },

    setupSubnodes: function() {
        const childProtos = this.protoValue().childProtos()
        const childNodes = childProtos.map((childProto) => {
            return BMProtoNode.clone().setProtoValue(childProto);
        })

        this.setSubnodes(childNodes);
        return this
    },

    /*
    prepareToAccess: function () {
        if (this._subnodes.length === 0) {
            this.setupSubnodes()
        }
    },
    */
})

