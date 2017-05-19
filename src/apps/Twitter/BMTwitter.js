
BMTwitter = BMApplet.extend().newSlots({
    type: "BMTwitter",
    feed: null,
    notifications: null,
    messages: null,
    profile: null,
    following: null,
    followers: null,
}).setSlots({
    init: function () {
        BMApplet.init.apply(this)
        this.setTitle("Twitter")
        

    },
})

