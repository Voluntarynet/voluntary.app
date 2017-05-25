
BMTwitterMessage = BMStorableNode.extend().newSlots({
    type: "BMTwitter",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setTitle("Twitter")
    },

})

