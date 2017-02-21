

BMLinkField = BMField.extend().newSlots({
    type: "BMLinkField",
}).setSlots({
    init: function () {
        BMField.init.apply(this)
    },

    nodeLink: function() {
        return this.value()
    },
        
})
