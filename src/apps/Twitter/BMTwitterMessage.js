
BMTwitterMessage = BMPrivateMessage.extend().newSlots({
    type: "BMTwitterMessage",
}).setSlots({
    init: function () {
        BMPrivateMessage.init.apply(this)
        this.setTitle("Twitter")
    },


    place: function() {
        
    },
})

