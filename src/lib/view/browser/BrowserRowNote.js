
BrowserRowNote = TextField.extend().newSlots({
    type: "BrowserRowNote",
}).setSlots({
    init: function () {
        TextField.init.apply(this)
        return this
    },
})
