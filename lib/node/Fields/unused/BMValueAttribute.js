
BMValueField = BMField.extend().newSlots({
    type: "BMValueField",

}).setSlots({
    init: function () {
        BMField.init.apply(this)
    },

})
