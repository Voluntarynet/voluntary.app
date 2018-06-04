
window.BMMethodsNode = BMNode.extend().newSlots({
    type: "BMMethodsNode",
    protoValue: Proto,
    methodName: null,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        //this.addAction("delete")
        this.setNodeMinWidth(300)
        this.setNoteIsSubnodeCount(true)
    },

    title: function () {
        return "slots"
    },

    subtitle: function () {
        
        return null
    },

    setupSubnodes: function() {
        var slotNames = this.protoValue().slotNames()

        var childNodes = slotNames.map((slotName) => {
            return BMMethodNode.clone().setProtoValue(this.protoValue()).setMethodName(slotName);
        })
        console.log(this.type() + " childNodes = ", childNodes.map((obj) => { return obj.title() }))

        this.setSubnodes(childNodes);
        return this
    },

    prepareToAccess: function () {
        if (this._subnodes.length == 0) {
            this.setupSubnodes()
        }
    },

    subnodes: function () {
        this.prepareToAccess()
        return BMNode.subnodes.apply(this)
    }
})

