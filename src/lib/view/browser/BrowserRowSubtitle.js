
BrowserRowSubtitle = Div.extend().newSlots({
    type: "BrowserRowSubtitle",
}).setSlots({
    init: function () {
        Div.init.apply(this)
        this.setDivClassName("BrowserRowSubtitle")
        this.setInnerHTML("")
        //this.turnOffUserSelect()
        this.turnOffUserSelect()
        return this
    },
})
