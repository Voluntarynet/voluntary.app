
window.BMMethodNode = BMNode.extend().newSlots({
    type: "BMMethodNode",
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
        if (this.methodName()) {
            return this.methodName()
        }

        return "?"
    },

    subtitle: function () {
        
        return null
    },

    /*

    prepareToAccess: function () {
        if (this._subnodes.length == 0) {
            this.setupSubnodes()
        }
    },

    subnodes: function () {
        this.prepareToAccess()
        return BMNode.subnodes.apply(this)
    }
    */
})

