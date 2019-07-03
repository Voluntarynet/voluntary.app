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
        //this.setCanDelete(true)

        this.setNodeMinWidth(300)
        //this.setNoteIsSubnodeCount(true)
    },

    title: function () {
        if (this.protoValue()) {
            let type = this.protoValue().type()
            const unwantedPrefix = "ideal."
            if (type.beginsWith(unwantedPrefix)) {
                type = type.after(unwantedPrefix)
            }
            return type
        }

        return "?"
    },

    decendantCount: function() {
        return this.protoValue().allDescendantProtos().length
    },

    subtitle: function() {
        const count = this.decendantCount()
        return count ? count : null;
    },

    note: function() {
        const count = this.decendantCount()
        return count ? "&gt;" : null;

    },

    setupSubnodes: function() {
        const childNodes = [
            BMSlotsNode.clone().setProtoValue(this.protoValue()), 
            BMSubclassesNode.clone().setProtoValue(this.protoValue()).setupSubnodes()
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

