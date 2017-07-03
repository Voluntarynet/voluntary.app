
BMBuys = BMStorableNode.extend().newSlots({
    type: "BMBuys",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setPid("_buys")
        this.setTitle("Buys")
        this.setActions(["add"])
        this.setSubnodeProto(BMBuy)
        this.setSubtitleIsSubnodeCount(true)
    },
})
