
BrowserRowNote = DivView.extend().newSlots({
    type: "BrowserRowNote",
	isSelected: false,
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.setDivClassName("BrowserRowNote")
        this.setInnerHTML("")
        this.turnOffUserSelect()
        return this
    },
})
