
BrowserRowSubtitle = DivView.extend().newSlots({
    type: "BrowserRowSubtitle",
	isSelected: false,
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.setInnerHTML("")
        this.turnOffUserSelect()
        return this
    },
})
