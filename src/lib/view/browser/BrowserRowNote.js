
BrowserRowNote = Div.extend().newSlots({
    type: "BrowserRowNote",
}).setSlots({
    init: function () {
        Div.init.apply(this)
        this.setDivClassName("BrowserRowNote")
        this.setInnerHTML("")
        this.turnOffUserSelect()
        return this
    },
})
