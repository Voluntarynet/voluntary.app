"use strict"

/*
	BMArchiveNode
	Way to compose 
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
        this.setNoteIsSubnodeCount(true)
    },

    title: function () {
        if (this.protoValue()) {
            return this.protoValue().type()
        }

        return "?"
    },

    subtitle: function () {
  
        return null
    },

    setupSubnodes: function() {
        console.log(this.type() + ".setupSubnodes()")
        var childProtos = this.protoValue().childProtos()
        console.log(this.type() + " childProtos = ", childProtos.map((obj) => { return obj.type() }))

        var childNodes = childProtos.map((childProto) => {
            return BMProtoNode.clone().setProtoValue(childProto);
        })
        console.log(this.type() + " childNodes = ", childNodes.map((obj) => { return obj.title() }))

        this.setSubnodes(childNodes);
        return this
    },

    prepareToAccess: function () {
        console.log(this.type() + " prepareToAccess ")
        if (this._subnodes.length == 0) {
            this.setupSubnodes()
        }
    },

    subnodes: function () {
        this.prepareToAccess()
        return BMNode.subnodes.apply(this)
    }
})

