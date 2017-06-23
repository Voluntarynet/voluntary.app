
BrowserRowSubtitle = Div.extend().newSlots({
    type: "BrowserRowSubtitle",
	isSelected: false,
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
