BrowserRowTitle = TextField.extend().newSlots({
    type: "BrowserRowTitle",
}).setSlots({
    init: function () {
        TextField.init.apply(this)
        this.setInnerHTML("title")
        return this
    },


})
