
BMMailMessage = BMPrivateMessage.extend().newSlots({
    type: "BMMailMessage",

}).setSlots({
    init: function () {
        BMPrivateMessage.init.apply(this)

    },

})
