

BMBoolField = BMField.extend().newSlots({
    type: "BMBoolField",
}).setSlots({
    init: function () {
        BMField.init.apply(this)
    },

})

