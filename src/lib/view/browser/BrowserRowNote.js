
BrowserRowNote = DivView.extend().newSlots({
    type: "BrowserRowNote",
	isSelected: false,
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.setInnerHTML("")
        this.turnOffUserSelect()
        return this
    },
})
