
BrowserFieldsColumn = BrowserColumn.extend().newSlots({
    type: "BrowserFieldsColumn",
}).setSlots({
    init: function () {
        BrowserColumn.init.apply(this)
        this.setDivClassName("BrowserFieldsColumn")
        this.setItemProto(null)
        return this
    },
})

