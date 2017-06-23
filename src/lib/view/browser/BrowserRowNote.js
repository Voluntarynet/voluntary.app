
BrowserRowNote = Div.extend().newSlots({
    type: "BrowserRowNote",
	isSelected: false,
}).setSlots({
    init: function () {
        Div.init.apply(this)
        this.setDivClassName("BrowserRowNote")
        this.setInnerHTML("")
        this.turnOffUserSelect()
        return this
    },
})
