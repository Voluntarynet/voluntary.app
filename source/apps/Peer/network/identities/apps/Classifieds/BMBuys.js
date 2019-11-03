"use strict"

/*

    BMBuys

*/

BMStorableNode.newSubclassNamed("BMBuys").newSlots({
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setTitle("Buys")
        this.setActions(["add"])
        this.setSubnodeProto(BMBuy)
        this.setSubtitleIsSubnodeCount(true)
    },
})
